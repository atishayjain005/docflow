import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("docflow_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  initials: text("initials").notNull(),
  accent: text("accent").notNull(),
});

export const documentsTable = pgTable(
  "docflow_documents",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    wordCount: integer("word_count").notNull().default(0),
  },
  (table) => [index("docflow_documents_owner_idx").on(table.ownerId)],
);

export const documentSharesTable = pgTable(
  "docflow_document_shares",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => documentsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
    sharedAt: timestamp("shared_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("docflow_document_share_unique").on(table.documentId, table.userId),
    index("docflow_document_shares_user_idx").on(table.userId),
  ],
);

export type User = typeof usersTable.$inferSelect;
export type Document = typeof documentsTable.$inferSelect;
export type DocumentShare = typeof documentSharesTable.$inferSelect;