import { 
  users, type User, type InsertUser,
  languages, type Language, type InsertLanguage,
  lessons, type Lesson, type InsertLesson,
  userProgress, type UserProgress, type InsertUserProgress,
  chatHistory, type ChatHistory, type InsertChatHistory
} from "@shared/schema";
import session from "express-session";
import { Pool } from "@neondatabase/serverless";
import connectPg from "connect-pg-simple";
import { createHash } from "crypto";
import { db } from "./db";
import { eq, and, sql, inArray } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  
  // User Progress methods
  getUserProgress(userId: number, lessonId: string): Promise<UserProgress | undefined>;
  getUserProgressByLanguage(userId: number, languageCode: string): Promise<UserProgress[]>;
  updateUserProgress(
    userId: number, 
    lessonId: string, 
    progressData: Partial<Omit<InsertUserProgress, 'userId' | 'lessonId'>>
  ): Promise<UserProgress>;
  markLessonComplete(userId: number, lessonId: string): Promise<UserProgress>;
  resetLanguageProgress(userId: number, languageCode: string): Promise<number>;
  
  // Chat History methods
  getChatHistory(userId: number, lessonId: string): Promise<ChatHistory | undefined>;
  saveChatHistory(userId: number, lessonId: string, messages: any[]): Promise<ChatHistory>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private lessons: Map<number, Lesson>;
  private progressRecords: Map<string, UserProgress>;
  private chatHistories: Map<string, ChatHistory>;
  private userCurrentId: number;
  private languageCurrentId: number;
  private lessonCurrentId: number;
  private progressCurrentId: number;
  private chatHistoryCurrentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.lessons = new Map();
    this.progressRecords = new Map();
    this.chatHistories = new Map();
    this.userCurrentId = 1;
    this.languageCurrentId = 1;
    this.lessonCurrentId = 1;
    this.progressCurrentId = 1;
    this.chatHistoryCurrentId = 1;
    
    // Initialize the session store
    if (process.env.DATABASE_URL) {
      // Using PostgreSQL
      const PostgresSessionStore = connectPg(session);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true, 
        tableName: 'session'
      });
    } else {
      // Using in-memory store (for development)
      const MemoryStore = require('memorystore')(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // 24h, prune expired entries
      });
    }
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
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

  // User Progress methods
  async getUserProgress(userId: number, lessonId: string): Promise<UserProgress | undefined> {
    const key = `${userId}:${lessonId}`;
    return this.progressRecords.get(key);
  }

  async getUserProgressByLanguage(userId: number, languageCode: string): Promise<UserProgress[]> {
    // Get all lessons for the language
    const languageLessons = await this.getLessonsByLanguage(languageCode);
    const lessonIds = languageLessons.map(lesson => lesson.lessonId);
    
    // Get all progress records for the user
    return Array.from(this.progressRecords.values())
      .filter(progress => 
        progress.userId === userId && 
        lessonIds.includes(progress.lessonId)
      );
  }

  async updateUserProgress(
    userId: number,
    lessonId: string,
    progressData: Partial<Omit<InsertUserProgress, 'userId' | 'lessonId'>>
  ): Promise<UserProgress> {
    const key = `${userId}:${lessonId}`;
    const existingProgress = this.progressRecords.get(key);
    
    if (existingProgress) {
      // Update existing record
      const updatedProgress: UserProgress = {
        ...existingProgress,
        ...progressData,
        lastAccessedAt: progressData.lastAccessedAt || new Date()
      };
      this.progressRecords.set(key, updatedProgress);
      return updatedProgress;
    } else {
      // Create new record
      const id = this.progressCurrentId++;
      const newProgress: UserProgress = {
        id,
        userId,
        lessonId,
        completed: progressData.completed ?? false,
        completedAt: progressData.completedAt || null,
        progress: progressData.progress ?? 0,
        score: progressData.score || null,
        lastAccessedAt: progressData.lastAccessedAt || new Date(),
        timeSpent: progressData.timeSpent ?? 0,
        notes: progressData.notes || null
      };
      this.progressRecords.set(key, newProgress);
      return newProgress;
    }
  }

  async markLessonComplete(userId: number, lessonId: string): Promise<UserProgress> {
    return this.updateUserProgress(userId, lessonId, {
      completed: true,
      completedAt: new Date(),
      progress: 100
    });
  }
  
  /**
   * Reset all progress for a user in a specific language
   * @returns The number of records deleted
   */
  async resetLanguageProgress(userId: number, languageCode: string): Promise<number> {
    // Get all lessons for the language
    const languageLessons = await this.getLessonsByLanguage(languageCode);
    const lessonIds = languageLessons.map(lesson => lesson.lessonId);
    
    if (!lessonIds.length) return 0;
    
    // Count how many records we're deleting
    let deleteCount = 0;
    
    // Delete all progress records for these lessons and this user
    for (const lessonId of lessonIds) {
      const key = `${userId}:${lessonId}`;
      if (this.progressRecords.has(key)) {
        this.progressRecords.delete(key);
        deleteCount++;
      }
    }
    
    return deleteCount;
  }
  
  // Chat History methods
  async getChatHistory(userId: number, lessonId: string): Promise<ChatHistory | undefined> {
    const key = `${userId}:${lessonId}`;
    return this.chatHistories.get(key);
  }
  
  async saveChatHistory(userId: number, lessonId: string, messages: any[]): Promise<ChatHistory> {
    const key = `${userId}:${lessonId}`;
    const existingHistory = this.chatHistories.get(key);
    
    if (existingHistory) {
      // Update existing record
      const updatedHistory: ChatHistory = {
        ...existingHistory,
        messages,
        updatedAt: new Date()
      };
      this.chatHistories.set(key, updatedHistory);
      return updatedHistory;
    } else {
      // Create new record
      const id = this.chatHistoryCurrentId++;
      const now = new Date();
      const newHistory: ChatHistory = {
        id,
        userId,
        lessonId,
        messages,
        createdAt: now,
        updatedAt: now
      };
      this.chatHistories.set(key, newHistory);
      return newHistory;
    }
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize the session store
    if (process.env.DATABASE_URL) {
      // Using PostgreSQL
      const PostgresSessionStore = connectPg(session);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true, 
        tableName: 'session'
      });
    } else {
      // Using in-memory store (for development)
      const MemoryStore = require('memorystore')(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // 24h, prune expired entries
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Language methods
  async getAllLanguages(): Promise<Language[]> {
    return await db.select().from(languages);
  }
  
  async getLanguageByCode(code: string): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.code, code));
    return language || undefined;
  }
  
  async createLanguage(insertLanguage: InsertLanguage): Promise<Language> {
    const [language] = await db
      .insert(languages)
      .values(insertLanguage)
      .returning();
    return language;
  }
  
  // Lesson methods
  async getAllLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons);
  }
  
  async getLessonById(lessonId: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.lessonId, lessonId));
    return lesson || undefined;
  }
  
  async getLessonsByLanguage(languageCode: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.languageCode, languageCode))
      .orderBy(lessons.orderIndex);
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values(insertLesson)
      .returning();
    return lesson;
  }

  // User Progress methods
  async getUserProgress(userId: number, lessonId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.lessonId, lessonId)
        )
      );
    return progress;
  }

  async getUserProgressByLanguage(userId: number, languageCode: string): Promise<UserProgress[]> {
    // Join userProgress with lessons to filter by languageCode
    return db
      .select({
        progress: userProgress,
        lesson: lessons
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.lessonId))
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(lessons.languageCode, languageCode)
        )
      )
      .then(rows => rows.map(row => row.progress));
  }

  async updateUserProgress(
    userId: number,
    lessonId: string,
    progressData: Partial<Omit<InsertUserProgress, 'userId' | 'lessonId'>>
  ): Promise<UserProgress> {
    // First check if a record already exists
    const existingProgress = await this.getUserProgress(userId, lessonId);

    if (existingProgress) {
      // Update existing record
      const updateValues: Partial<UserProgress> = {};
      
      if (progressData.completed !== undefined) updateValues.completed = progressData.completed;
      if (progressData.completedAt !== undefined) updateValues.completedAt = progressData.completedAt;
      if (progressData.progress !== undefined) updateValues.progress = progressData.progress;
      if (progressData.score !== undefined) updateValues.score = progressData.score;
      if (progressData.timeSpent !== undefined) updateValues.timeSpent = progressData.timeSpent;
      if (progressData.notes !== undefined) updateValues.notes = progressData.notes;
      updateValues.lastAccessedAt = progressData.lastAccessedAt || new Date();
      
      const [updatedProgress] = await db
        .update(userProgress)
        .set(updateValues)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.lessonId, lessonId)
          )
        )
        .returning();
      return updatedProgress;
    } else {
      // Create new record
      const [newProgress] = await db
        .insert(userProgress)
        .values({
          userId,
          lessonId,
          completed: progressData.completed ?? false,
          completedAt: progressData.completedAt || null,
          progress: progressData.progress ?? 0,
          score: progressData.score || null,
          lastAccessedAt: progressData.lastAccessedAt || new Date(),
          timeSpent: progressData.timeSpent ?? 0,
          notes: progressData.notes || null
        })
        .returning();
      return newProgress;
    }
  }

  async markLessonComplete(userId: number, lessonId: string): Promise<UserProgress> {
    return this.updateUserProgress(userId, lessonId, {
      completed: true,
      completedAt: new Date(),
      progress: 100
    });
  }
  
  /**
   * Reset all progress for a user in a specific language
   * @returns The number of records deleted
   */
  async resetLanguageProgress(userId: number, languageCode: string): Promise<number> {
    // First get all lessons for the language
    const lessons = await this.getLessonsByLanguage(languageCode);
    const lessonIds = lessons.map(lesson => lesson.lessonId);
    
    if (!lessonIds.length) return 0;
    
    // Now delete all progress records for these lessons and this user
    const result = await db
      .delete(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          inArray(userProgress.lessonId, lessonIds)
        )
      );
    
    return result.rowCount ?? 0;
  }
}

// Use database storage if DATABASE_URL is available, otherwise use memory storage
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
