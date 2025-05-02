import { 
  users, type User, type InsertUser,
  languages, type Language, type InsertLanguage,
  lessons, type Lesson, type InsertLesson 
} from "@shared/schema";
import session from "express-session";
import { Pool } from "@neondatabase/serverless";
import connectPg from "connect-pg-simple";
import { createHash } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private lessons: Map<number, Lesson>;
  private userCurrentId: number;
  private languageCurrentId: number;
  private lessonCurrentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.lessons = new Map();
    this.userCurrentId = 1;
    this.languageCurrentId = 1;
    this.lessonCurrentId = 1;
    
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
}

// Use database storage if DATABASE_URL is available, otherwise use memory storage
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
