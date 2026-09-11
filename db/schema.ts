import { sqliteTable, integer, text, uniqueIndex, index, primaryKey } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatgptId: text('chatgpt_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  ttsEnabled: integer('tts_enabled', { mode: 'boolean' }).notNull().default(true),
  ttsAutoPlay: integer('tts_auto_play', { mode: 'boolean' }).notNull().default(false),
  preferences: text('preferences').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
});
export const progress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull(),
  languageCode: text('language_code').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  version: integer('version').notNull().default(0),
}, t => [uniqueIndex('progress_user_lesson').on(t.userId, t.lessonId), index('progress_user_language').on(t.userId,t.languageCode)]);
export const chats = sqliteTable('chat_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull(),
  messages: text('messages', { mode: 'json' }).notNull(),
  scratchPad: text('scratch_pad', { mode: 'json' }).notNull(),
  updatedAt: text('updated_at').notNull(),
  version: integer('version').notNull().default(0),
}, t => [uniqueIndex('chat_user_lesson').on(t.userId,t.lessonId)]);
export const conversations = sqliteTable('conversation_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageCode: text('language_code').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  version: integer('version').notNull().default(0),
}, t => [index('sessions_user_language').on(t.userId,t.languageCode)]);
export const contacts = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: text('data', { mode: 'json' }).notNull(),
},t => [index('contacts_user').on(t.userId)]);
export const blogs = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  status: text('status').notNull().default('draft'),
  data: text('data', { mode: 'json' }).notNull(),
}, t => [index('blog_status').on(t.status)]);
export const uploads = sqliteTable('uploads', {
  objectKey: text('object_key').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentType: text('content_type').notNull(),
}, t => [index('uploads_user').on(t.userId)]);

export const learningSessions = sqliteTable('learning_sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityId: text('activity_id').notNull(),
  languageCode: text('language_code').notNull(),
  contentVersion: text('content_version').notNull(),
  state: text('state').notNull(),
  version: integer('version').notNull().default(0),
  lastEventId: text('last_event_id'),
  updatedAt: text('updated_at').notNull(),
  dueAt: text('due_at'),
}, t => [uniqueIndex('learning_user_activity').on(t.userId,t.activityId)]);
export const learningEvents = sqliteTable('learning_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: text('event_id').notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull().references(() => learningSessions.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  data: text('data').notNull(),
  createdAt: text('created_at').notNull(),
}, t => [uniqueIndex('learning_user_event').on(t.userId,t.eventId),index('learning_session_events').on(t.sessionId,t.id)]);
export const lessonDrafts = sqliteTable('lesson_drafts', {
  lastRequestId:text('last_request_id'),
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull(),
  data: text('data').notNull(),
  version: integer('version').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
}, t => [uniqueIndex('draft_user_lesson').on(t.userId,t.lessonId)]);
export const aiUsage = sqliteTable('ai_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  day: text('day').notNull(),
  kind: text('kind').notNull(),
  used: integer('used').notNull().default(0),
}, t => [uniqueIndex('usage_user_day_kind').on(t.userId,t.day,t.kind)]);

export const learningExposures=sqliteTable('learning_exposures',{
 id:integer('id').primaryKey({autoIncrement:true}),
 userId:integer('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
 languageCode:text('language_code').notNull(),materialKey:text('material_key').notNull(),source:text('source').notNull(),seenAt:text('seen_at').notNull(),
},t=>[uniqueIndex('exposures_user_language_key').on(t.userId,t.languageCode,t.materialKey),index('exposures_user_language').on(t.userId,t.languageCode)]);
export const learningRequests=sqliteTable('learning_requests',{
 userId:integer('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),requestId:text('request_id').notNull(),resource:text('resource').notNull(),status:text('status').notNull(),response:text('response'),createdAt:text('created_at').notNull(),
},t=>[primaryKey({columns:[t.userId,t.requestId]})]);
