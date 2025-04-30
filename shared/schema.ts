import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  flagCode: text("flag_code").notNull(),
  speakers: integer("speakers").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  lessonId: text("lesson_id").notNull().unique(),
  languageCode: text("language_code").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  lessonId: text("lesson_id").notNull().references(() => lessons.lessonId),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  scratchPad: jsonb("scratch_pad").notNull().default({
    knownVocabulary: [],
    knownStructures: [],
    struggles: [],
    nextFocus: null
  }),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  chatSessions: many(chatSessions),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  chatSessions: many(chatSessions),
}));

export const chatSessionsRelations = relations(chatSessions, ({ many, one }) => ({
  messages: many(chatMessages),
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [chatSessions.lessonId],
    references: [lessons.lessonId],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLanguageSchema = createInsertSchema(languages).pick({
  code: true,
  name: true,
  flagCode: true,
  speakers: true,
  isAvailable: true,
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  lessonId: true,
  languageCode: true,
  title: true,
  content: true,
  orderIndex: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  lessonId: true,
  scratchPad: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Message types used by the chat component
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ScratchPad {
  knownVocabulary: string[];
  knownStructures: string[];
  struggles: string[];
  nextFocus: string | null;
}
