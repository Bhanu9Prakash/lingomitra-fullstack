import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod/v4";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Make password optional for OAuth users
  // Google OAuth fields
  googleId: text("google_id").unique(),
  profilePicture: text("profile_picture"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  // Add subscription information
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionExpiry: timestamp("subscription_expiry"),
  // Admin flag
  isAdmin: boolean("is_admin").default(false).notNull(),
  // Email verification
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  // Password reset
  resetPasswordToken: text("reset_password_token"),
  resetPasswordTokenExpiry: timestamp("reset_password_token_expiry"),
  // TTS preferences
  ttsEnabled: boolean("tts_enabled").default(true).notNull(),
  ttsAutoPlay: boolean("tts_auto_play").default(true).notNull(),
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
  googleId: true,
  profilePicture: true,
  firstName: true,
  lastName: true,
  isAdmin: true,
  subscriptionTier: true,
  subscriptionExpiry: true,
  emailVerified: true,
  verificationToken: true,
  verificationTokenExpiry: true,
  resetPasswordToken: true,
  resetPasswordTokenExpiry: true,
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
  progress: integer("progress").notNull().default(0), // Percentage, always 0–100.
  score: integer("score"), // Self-checked reasoning coverage, always 0–100.
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(),
  timeSpent: integer("time_spent").notNull().default(0), // Seconds.
  notes: text("notes"), // Validated learning evidence and review state.
}, (table) => [
  uniqueIndex("user_progress_user_lesson_unique").on(table.userId, table.lessonId),
]);

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

// Contact Form Submissions Table
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isResolved: boolean("is_resolved").notNull().default(false),
  notes: text("notes"),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  category: true,
  message: true,
  notes: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Audio Cache Table for TTS
export const audioCache = pgTable("audio_cache", {
  id: serial("id").primaryKey(),
  textHash: text("text_hash").notNull().unique(), // Hash of text + language
  languageCode: text("language_code").notNull(),
  audioData: text("audio_data").notNull(), // Base64 encoded audio
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAudioCacheSchema = createInsertSchema(audioCache).pick({
  textHash: true,
  languageCode: true,
  audioData: true,
});

export type InsertAudioCache = z.infer<typeof insertAudioCacheSchema>;
export type AudioCache = typeof audioCache.$inferSelect;

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(), // Markdown content
  excerpt: text("excerpt"), // Short description for SEO
  featuredImage: text("featured_image"), // URL to featured image
  authorId: integer("author_id").notNull().references(() => users.id),
  status: text("status").notNull().default("draft"), // draft, published
  tags: text("tags").array().default([]), // Array of tags
  metaTitle: text("meta_title"), // SEO meta title
  metaDescription: text("meta_description"), // SEO meta description
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const blogPostsRelations = {
  author: () => ({
    relation: "n:1",
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
};

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  featuredImage: true,
  authorId: true,
  status: true,
  tags: true,
  metaTitle: true,
  metaDescription: true,
  publishedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Conversation Practice Sessions Table
export const conversationSessions = pgTable("conversation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  languageCode: text("language_code").notNull(),
  topic: text("topic").notNull(), // e.g., "restaurant", "travel", "business"
  difficultyLevel: text("difficulty_level").notNull().default("beginner"), // beginner, intermediate, advanced
  scenario: text("scenario").notNull(), // Specific scenario description
  messages: jsonb("messages").notNull().default([]), // Array of conversation messages
  feedback: text("feedback"), // AI feedback on conversation
  score: integer("score"), // Overall conversation score (0-100)
  duration: integer("duration").notNull().default(0), // Duration in seconds
  status: text("status").notNull().default("active"), // active, completed, paused
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const conversationSessionsRelations = {
  user: () => ({
    relation: "n:1",
    fields: [conversationSessions.userId],
    references: [users.id],
  }),
};

export const insertConversationSessionSchema = createInsertSchema(conversationSessions).pick({
  userId: true,
  languageCode: true,
  topic: true,
  difficultyLevel: true,
  scenario: true,
  messages: true,
  feedback: true,
  score: true,
  duration: true,
  status: true,
  completedAt: true,
});

export type InsertConversationSession = z.infer<typeof insertConversationSessionSchema>;
export type ConversationSession = typeof conversationSessions.$inferSelect;

// Conversation Transcriptions Table
export const conversationTranscriptions = pgTable("conversation_transcriptions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => conversationSessions.id),
  audioData: text("audio_data").notNull(), // Base64 encoded audio
  transcription: text("transcription").notNull(),
  languageCode: text("language_code").notNull(),
  confidence: integer("confidence"), // Transcription confidence (0-100)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conversationTranscriptionsRelations = {
  session: () => ({
    relation: "n:1",
    fields: [conversationTranscriptions.sessionId],
    references: [conversationSessions.id],
  }),
};

export const insertConversationTranscriptionSchema = createInsertSchema(conversationTranscriptions).pick({
  sessionId: true,
  audioData: true,
  transcription: true,
  languageCode: true,
  confidence: true,
});

export type InsertConversationTranscription = z.infer<typeof insertConversationTranscriptionSchema>;
export type ConversationTranscription = typeof conversationTranscriptions.$inferSelect;
