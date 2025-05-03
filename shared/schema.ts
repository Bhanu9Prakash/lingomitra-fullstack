import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  // Add subscription information
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionExpiry: timestamp("subscription_expiry"),
  // Admin flag
  isAdmin: boolean("is_admin").default(false).notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertLanguageSchema = createInsertSchema(languages).pick({
  code: true,
  name: true,
  flagCode: true,
  speakers: true,
  isAvailable: true,
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  lessonId: text("lesson_id").notNull().references(() => lessons.lessonId),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").notNull().default(0), // Progress as percentage (0-100)
  score: integer("score"), // Optional score for assessments or quizzes
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(),
  timeSpent: integer("time_spent").notNull().default(0), // Time spent in seconds
  notes: text("notes"), // Optional notes or flashcards
});

// Relations
export const usersRelations = {
  progress: () => ({
    relation: "1:n",
    fields: [users.id],
    references: [userProgress.userId],
  }),
};

export const lessonsRelations = {
  progress: () => ({
    relation: "1:n",
    fields: [lessons.lessonId],
    references: [userProgress.lessonId],
  }),
};

export const userProgressRelations = {
  user: () => ({
    relation: "n:1",
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: () => ({
    relation: "n:1",
    fields: [userProgress.lessonId],
    references: [lessons.lessonId],
  }),
};

export const insertLessonSchema = createInsertSchema(lessons).pick({
  lessonId: true,
  languageCode: true,
  title: true,
  content: true,
  orderIndex: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  lessonId: true,
  completed: true,
  completedAt: true,
  progress: true,
  score: true,
  lastAccessedAt: true,
  timeSpent: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Chat History Table
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  lessonId: text("lesson_id").notNull().references(() => lessons.lessonId),
  messages: jsonb("messages").notNull().default([]),  // Array of message objects
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatHistoryRelations = {
  user: () => ({
    relation: "n:1",
    fields: [chatHistory.userId],
    references: [users.id],
  }),
  lesson: () => ({
    relation: "n:1",
    fields: [chatHistory.lessonId],
    references: [lessons.lessonId],
  }),
};

export const insertChatHistorySchema = createInsertSchema(chatHistory).pick({
  userId: true,
  lessonId: true,
  messages: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;
