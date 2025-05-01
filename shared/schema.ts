import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;
