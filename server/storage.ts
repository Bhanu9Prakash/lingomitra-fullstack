import { 
  users, type User, type InsertUser,
  languages, type Language, type InsertLanguage,
  lessons, type Lesson, type InsertLesson,
  chatSessions, type ChatSession, type InsertChatSession,
  chatMessages, type ChatMessage, type InsertChatMessage,
  type Message, type ScratchPad
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, asc, and, desc } from "drizzle-orm";
import { Store } from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import session from "express-session";
import memorystore from "memorystore";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Language methods
  getAllLanguages(): Promise<Language[]>;
  getLanguageByCode(code: string): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  
  // Lesson methods
  getAllLessons(): Promise<Lesson[]>;
  getLessonById(lessonId: string): Promise<Lesson | undefined>;
  getLessonsByLanguage(languageCode: string): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Chat methods
  getChatSessionsForUser(userId: number): Promise<ChatSession[]>;
  getChatSessionForUserAndLesson(userId: number, lessonId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSessionScratchPad(sessionId: number, scratchPad: ScratchPad): Promise<void>;
  getChatMessagesForSession(sessionId: number): Promise<Message[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Session store for express-session
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;
  
  constructor(pool: Pool) {
    const PgStore = connectPgSimple(session);
    this.sessionStore = new PgStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const result = await db.insert(users).values({
      ...insertUser,
      createdAt: now
    }).returning();
    return result[0];
  }
  
  // Language methods
  async getAllLanguages(): Promise<Language[]> {
    return await db.select().from(languages);
  }
  
  async getLanguageByCode(code: string): Promise<Language | undefined> {
    const result = await db.select().from(languages).where(eq(languages.code, code));
    return result[0];
  }
  
  async createLanguage(insertLanguage: InsertLanguage): Promise<Language> {
    const result = await db.insert(languages).values(insertLanguage).returning();
    return result[0];
  }
  
  // Lesson methods
  async getAllLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons);
  }
  
  async getLessonById(lessonId: string): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.lessonId, lessonId));
    return result[0];
  }
  
  async getLessonsByLanguage(languageCode: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.languageCode, languageCode))
      .orderBy(asc(lessons.orderIndex));
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const result = await db.insert(lessons).values(insertLesson).returning();
    return result[0];
  }
  
  // Chat methods
  async getChatSessionsForUser(userId: number): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }
  
  async getChatSessionForUserAndLesson(userId: number, lessonId: string): Promise<ChatSession | undefined> {
    const result = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.userId, userId),
        eq(chatSessions.lessonId, lessonId)
      ))
      .orderBy(desc(chatSessions.updatedAt));
      
    return result[0];
  }
  
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const result = await db.insert(chatSessions).values(session).returning();
    return result[0];
  }
  
  async updateChatSessionScratchPad(sessionId: number, scratchPad: ScratchPad): Promise<void> {
    await db
      .update(chatSessions)
      .set({ 
        scratchPad: scratchPad,
        updatedAt: new Date()
      })
      .where(eq(chatSessions.id, sessionId));
  }
  
  async getChatMessagesForSession(sessionId: number): Promise<Message[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
      
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
  }
  
  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    
    // Update the session's updatedAt timestamp
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, message.sessionId));
      
    return result[0];
  }
}

export class MemStorage implements IStorage {
  // Previous memory storage implementation
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private lessons: Map<number, Lesson>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  private userCurrentId: number;
  private languageCurrentId: number;
  private lessonCurrentId: number;
  private sessionCurrentId: number;
  private messageCurrentId: number;
  sessionStore: Store;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.lessons = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.userCurrentId = 1;
    this.languageCurrentId = 1;
    this.lessonCurrentId = 1;
    this.sessionCurrentId = 1;
    this.messageCurrentId = 1;
    
    // Create in-memory session store
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 }); // 24h
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Language methods
  async getAllLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values());
  }
  
  async getLanguageByCode(code: string): Promise<Language | undefined> {
    return Array.from(this.languages.values()).find(
      (language) => language.code === code
    );
  }
  
  async createLanguage(insertLanguage: InsertLanguage): Promise<Language> {
    const id = this.languageCurrentId++;
    // Ensure isAvailable is defined if not already
    const language: Language = { 
      ...insertLanguage, 
      id,
      isAvailable: insertLanguage.isAvailable !== undefined ? insertLanguage.isAvailable : true
    };
    this.languages.set(id, language);
    return language;
  }
  
  // Lesson methods
  async getAllLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }
  
  async getLessonById(lessonId: string): Promise<Lesson | undefined> {
    return Array.from(this.lessons.values()).find(
      (lesson) => lesson.lessonId === lessonId
    );
  }
  
  async getLessonsByLanguage(languageCode: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter((lesson) => lesson.languageCode === languageCode)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonCurrentId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }
  
  // Chat methods
  async getChatSessionsForUser(userId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  async getChatSessionForUserAndLesson(userId: number, lessonId: string): Promise<ChatSession | undefined> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId && session.lessonId === lessonId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
  }
  
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const id = this.sessionCurrentId++;
    const now = new Date();
    const defaultScratchPad: ScratchPad = {
      knownVocabulary: [],
      knownStructures: [],
      struggles: [],
      nextFocus: null
    };
    const chatSession: ChatSession = {
      ...session,
      id,
      createdAt: now,
      updatedAt: now,
      scratchPad: session.scratchPad || defaultScratchPad
    };
    this.chatSessions.set(id, chatSession);
    return chatSession;
  }
  
  async updateChatSessionScratchPad(sessionId: number, scratchPad: ScratchPad): Promise<void> {
    const session = this.chatSessions.get(sessionId);
    if (session) {
      this.chatSessions.set(sessionId, {
        ...session,
        scratchPad,
        updatedAt: new Date()
      });
    }
  }
  
  async getChatMessagesForSession(sessionId: number): Promise<Message[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
  }
  
  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageCurrentId++;
    const chatMessage: ChatMessage = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    
    // Update session updatedAt time
    const session = this.chatSessions.get(message.sessionId);
    if (session) {
      this.chatSessions.set(message.sessionId, {
        ...session,
        updatedAt: new Date()
      });
    }
    
    return chatMessage;
  }
}

// Use DatabaseStorage since we have a database setup
export const storage = new DatabaseStorage(pool);
