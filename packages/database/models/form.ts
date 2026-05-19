import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  theme: varchar("theme", { length: 50 }).default("anime").notNull(), // 'anime' | 'tech' | 'retro'
  visibility: varchar("visibility", { length: 50 }).default("public").notNull(), // 'public' | 'unlisted'
  status: varchar("status", { length: 50 }).default("draft").notNull(), // 'draft' | 'published'
  password: text("password"),
  expiresAt: timestamp("expires_at"),
  responseLimit: integer("response_limit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const fieldsTable = pgTable("fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => formsTable.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'short_text' | 'long_text' | 'email' | 'number' | 'single_select' | 'multi_select' | 'checkbox' | 'rating' | 'date'
  label: text("label").notNull(),
  description: text("description"),
  required: boolean("required").default(false).notNull(),
  placeholder: text("placeholder"),
  options: jsonb("options"), // { label: string, value: string }[] for select / multiselect / checkbox
  validations: jsonb("validations"), // { min?: number, max?: number, pattern?: string, etc. }
  logic: jsonb("logic"), // { action: 'show'|'hide', fieldId: string, value: any }[]
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => formsTable.id, { onDelete: "cascade" })
    .notNull(),
  answers: jsonb("answers").notNull(), // Record<fieldId, string | string[] | number | boolean>
  ipAddress: varchar("ip_address", { length: 255 }),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const apiKeysTable = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;

export type SelectField = typeof fieldsTable.$inferSelect;
export type InsertField = typeof fieldsTable.$inferInsert;

export type SelectResponse = typeof responsesTable.$inferSelect;
export type InsertResponse = typeof responsesTable.$inferInsert;

export type SelectApiKey = typeof apiKeysTable.$inferSelect;
export type InsertApiKey = typeof apiKeysTable.$inferInsert;
