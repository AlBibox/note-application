import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  content: text('content').notNull().default(''),
  noteDate: text('note_date').notNull(),
  tag: text('tag').notNull(),
  favorite: boolean('favorite').notNull().default(false),
  archived: boolean('archived').notNull().default(false),
  trashed: boolean('trashed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Note = typeof notes.$inferSelect
