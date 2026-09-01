import { Router, type IRouter } from "express";
import { desc, eq, inArray } from "drizzle-orm";
import { db, documentSharesTable, documentsTable, usersTable } from "@workspace/db";
import {
  CreateDocumentBody,
  CreateDocumentResponse,
  GetDashboardResponse,
  GetDocumentParams,
  GetDocumentResponse,
  ImportDocumentBody,
  ImportDocumentResponse,
  ListDocumentsResponse,
  ShareDocumentBody,
  ShareDocumentParams,
  ShareDocumentResponse,
  UpdateDocumentBody,
  UpdateDocumentParams,
  UpdateDocumentResponse,
} from "@workspace/api-zod";
import { createId, seedDemoData } from "../lib/seed";
import { requireUser } from "../middlewares/auth";

const router: IRouter = Router();
router.use(requireUser);

type UserRow = typeof usersTable.$inferSelect;
type DocumentRow = typeof documentsTable.$inferSelect;
type ShareRow = typeof documentSharesTable.$inferSelect;

function wordCount(content: string): number {
  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

function preview(content: string): string {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markdownToHtml(value: string): string {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    blocks.push(`<${listType}>${listItems.join("")}</${listType}>`);
    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
      continue;
    }
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(`<li>${escapeHtml(unordered[1])}</li>`);
      continue;
    }
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(`<li>${escapeHtml(ordered[1])}</li>`);
      continue;
    }
    flushList();
    blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
  }
  flushList();
  return blocks.join("");
}

async function getUsersById(ids: string[]): Promise<Map<string, UserRow>> {
  if (ids.length === 0) return new Map();
  const rows = await db.select().from(usersTable).where(inArray(usersTable.id, ids));
  return new Map(rows.map((user) => [user.id, user]));
}

async function getWorkspaceRows(userId: string) {
  const userShares = await db
    .select()
    .from(documentSharesTable)
    .where(eq(documentSharesTable.userId, userId));

  const sharedDocIds = userShares.map((s) => s.documentId);

  const [owned, shared] = await Promise.all([
    db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.ownerId, userId))
      .orderBy(desc(documentsTable.updatedAt)),
    sharedDocIds.length > 0
      ? db
          .select()
          .from(documentsTable)
          .where(inArray(documentsTable.id, sharedDocIds))
          .orderBy(desc(documentsTable.updatedAt))
      : Promise.resolve([] as (typeof documentsTable.$inferSelect)[]),
  ]);

  const seen = new Set<string>();
  const visibleDocuments: (typeof documentsTable.$inferSelect)[] = [];
  for (const doc of [...owned, ...shared]) {
    if (!seen.has(doc.id)) {
      seen.add(doc.id);
      visibleDocuments.push(doc);
    }
  }

  const visibleIds = visibleDocuments.map((d) => d.id);
  const allShares =
    visibleIds.length > 0
      ? await db
          .select()
          .from(documentSharesTable)
          .where(inArray(documentSharesTable.documentId, visibleIds))
      : [];

  const userIds = [
    ...new Set([
      ...visibleDocuments.map((d) => d.ownerId),
      ...allShares.map((s) => s.userId),
    ]),
  ];
  const users = await getUsersById(userIds);

  return { documents: visibleDocuments, shares: allShares, users };
}

function toShare(share: ShareRow, user: UserRow) {
  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    initials: user.initials,
    accent: user.accent,
    sharedAt: share.sharedAt,
  };
}

function toDetail(
  document: DocumentRow,
  userId: string,
  users: Map<string, UserRow>,
  shares: ShareRow[],
) {
  const owner = users.get(document.ownerId);
  const documentShares = shares
    .filter((share) => share.documentId === document.id)
    .map((share) => {
      const user = users.get(share.userId);
      return user ? toShare(share, user) : null;
    })
    .filter((share): share is NonNullable<typeof share> => share !== null);

  return {
    id: document.id,
    title: document.title,
    content: document.content,
    ownerId: document.ownerId,
    ownerName: owner?.name ?? "Unknown owner",
    updatedAt: document.updatedAt,
    createdAt: document.createdAt,
    wordCount: document.wordCount,
    access: document.ownerId === userId ? "owned" : "shared",
    shares: documentShares,
  };
}

function toListItem(
  document: DocumentRow,
  userId: string,
  users: Map<string, UserRow>,
) {
  return {
    id: document.id,
    title: document.title,
    ownerId: document.ownerId,
    ownerName: users.get(document.ownerId)?.name ?? "Unknown owner",
    updatedAt: document.updatedAt,
    wordCount: document.wordCount,
    access: document.ownerId === userId ? "owned" : "shared",
    preview: preview(document.content),
  };
}

router.get("/documents", async (req, res): Promise<void> => {
  try {
    await seedDemoData();
    const userId = res.locals.userId as string;
    const { documents, users } = await getWorkspaceRows(userId);
    res.json(
      ListDocumentsResponse.parse(
        documents.map((document) => toListItem(document, userId, users)),
      ),
    );
  } catch (err) {
    console.error("[GET /documents]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents", async (req, res): Promise<void> => {
  try {
    await seedDemoData();
    const userId = res.locals.userId as string;
    const user = (await getUsersById([userId])).get(userId);
    if (!user) {
      res.status(400).json({ error: "Unknown user" });
      return;
    }
    const parsed = CreateDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const now = new Date();
    const [document] = await db
      .insert(documentsTable)
      .values({
        id: createId(),
        title: parsed.data.title.trim(),
        content: parsed.data.content,
        ownerId: userId,
        wordCount: wordCount(parsed.data.content),
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    res.status(201).json(
      CreateDocumentResponse.parse({
        ...toDetail(document, userId, new Map([[user.id, user]]), []),
      }),
    );
  } catch (err) {
    console.error("[POST /documents]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents/import", async (req, res): Promise<void> => {
  try {
    await seedDemoData();
    const userId = res.locals.userId as string;
    const user = (await getUsersById([userId])).get(userId);
    if (!user) {
      res.status(400).json({ error: "Unknown user" });
      return;
    }
    const parsed = ImportDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const extension = parsed.data.filename.toLowerCase().split(".").pop();
    if (extension !== "txt" && extension !== "md" && extension !== "markdown") {
      res.status(400).json({ error: "Only .txt and .md files are supported." });
      return;
    }
    const now = new Date();
    // Plain text is treated as markdown (line breaks → paragraphs, etc.)
    const html = markdownToHtml(parsed.data.content);
    const [document] = await db
      .insert(documentsTable)
      .values({
        id: createId(),
        title: parsed.data.filename.replace(/\.(markdown|md|txt)$/i, "") || "Imported document",
        content: html,
        ownerId: userId,
        wordCount: wordCount(html),
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    res.status(201).json(
      ImportDocumentResponse.parse({
        ...toDetail(document, userId, new Map([[user.id, user]]), []),
      }),
    );
  } catch (err) {
    console.error("[POST /documents/import]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  try {
    await seedDemoData();
    const userId = res.locals.userId as string;
    const params = GetDocumentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const { documents, shares, users } = await getWorkspaceRows(userId);
    const document = documents.find((item) => item.id === params.data.id);
    if (!document) {
      res.status(404).json({ error: "Document not found or inaccessible" });
      return;
    }
    res.json(GetDocumentResponse.parse(toDetail(document, userId, users, shares)));
  } catch (err) {
    console.error("[GET /documents/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/documents/:id", async (req, res): Promise<void> => {
  try {
    await seedDemoData();
    const userId = res.locals.userId as string;
    const params = UpdateDocumentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { documents, shares, users } = await getWorkspaceRows(userId);
    const existing = documents.find((item) => item.id === params.data.id);
    if (!existing) {
      res.status(404).json({ error: "Document not found or inaccessible" });
      return;
    }
    const [document] = await db
      .update(documentsTable)
      .set({
        ...(parsed.data.title !== undefined && { title: parsed.data.title.trim() }),
        ...(parsed.data.content !== undefined && {
          content: parsed.data.content,
          wordCount: wordCount(parsed.data.content),
        }),
        updatedAt: new Date(),
      })
      .where(eq(documentsTable.id, existing.id))
      .returning();
    res.json(UpdateDocumentResponse.parse(toDetail(document, userId, users, shares)));
  } catch (err) {
    console.error("[PATCH /documents/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents/:id/share", async (req, res): Promise<void> => {
  try {
    await seedDemoData();
    const ownerId = res.locals.userId as string;
    const params = ShareDocumentParams.safeParse(req.params);
    const parsed = ShareDocumentBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: "A valid document and user are required." });
      return;
    }
    const { documents, shares, users } = await getWorkspaceRows(ownerId);
    const document = documents.find((item) => item.id === params.data.id);
    if (!document || document.ownerId !== ownerId) {
      res.status(404).json({ error: "Document not found or you are not the owner." });
      return;
    }
    const target = (await getUsersById([parsed.data.userId])).get(parsed.data.userId);
    if (!target || target.id === ownerId) {
      res.status(400).json({ error: "Choose a different seeded teammate." });
      return;
    }
    const alreadyShared = shares.some(
      (share) => share.documentId === document.id && share.userId === target.id,
    );
    if (!alreadyShared) {
      await db.insert(documentSharesTable).values({
        id: createId(),
        documentId: document.id,
        userId: target.id,
      });
    }
    const refreshed = await getWorkspaceRows(ownerId);
    const updated = refreshed.documents.find((item) => item.id === document.id);
    if (!updated) {
      res.status(404).json({ error: "Document not found after sharing." });
      return;
    }
    res.json(
      ShareDocumentResponse.parse(
        toDetail(updated, ownerId, refreshed.users, refreshed.shares),
      ),
    );
  } catch (err) {
    console.error("[POST /documents/:id/share]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", async (req, res): Promise<void> => {
  try {
    await seedDemoData();
    const userId = res.locals.userId as string;
    const { documents, users } = await getWorkspaceRows(userId);
    const owned = documents.filter((document) => document.ownerId === userId);
    const shared = documents.filter((document) => document.ownerId !== userId);
    res.json(
      GetDashboardResponse.parse({
        ownedCount: owned.length,
        sharedCount: shared.length,
        totalWords: documents.reduce((sum, document) => sum + document.wordCount, 0),
        recent: documents.slice(0, 5).map((document) => toListItem(document, userId, users)),
      }),
    );
  } catch (err) {
    console.error("[GET /dashboard]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
