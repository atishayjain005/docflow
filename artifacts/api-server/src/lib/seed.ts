import { db, documentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const demoUsers = [
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya@docflow.test",
    initials: "MC",
    accent: "#e3a36f",
  },
  {
    id: "sam",
    name: "Sam Rivera",
    email: "sam@docflow.test",
    initials: "SR",
    accent: "#7f9cf5",
  },
  {
    id: "noor",
    name: "Noor Patel",
    email: "noor@docflow.test",
    initials: "NP",
    accent: "#7bc7a5",
  },
];

let seeded = false;

export async function seedDemoData(): Promise<void> {
  if (seeded) return;

  await db.insert(usersTable).values(demoUsers).onConflictDoNothing();

  const existing = await db
    .select({ id: documentsTable.id })
    .from(documentsTable)
    .where(eq(documentsTable.ownerId, "maya"))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(documentsTable).values({
      id: "welcome-to-docflow",
      title: "Welcome to DocFlow",
      ownerId: "maya",
      content:
        "<h1>Welcome to DocFlow</h1><p>A focused space for work that moves with your team.</p><p>Try editing this document, then share it with Sam or Noor.</p><h2>What to try</h2><ul><li>Use the formatting toolbar to shape a thought.</li><li>Import a Markdown file from the workspace.</li><li>Share this document with a teammate.</li></ul>",
      wordCount: 39,
    });

    await db.insert(documentsTable).values({
      id: "q3-planning",
      title: "Q3 planning notes",
      ownerId: "sam",
      content:
        "<h1>Q3 planning notes</h1><p>Our next quarter is about fewer, clearer bets.</p><ol><li>Make the core workflow feel effortless.</li><li>Give teams a shared source of truth.</li><li>Measure momentum, not motion.</li></ol>",
      wordCount: 29,
    });
  }

  seeded = true;
}

export function createId(): string {
  return randomUUID();
}
