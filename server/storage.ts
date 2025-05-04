import { 
  users, type User, type InsertUser,
  languages, type Language, type InsertLanguage,
  lessons, type Lesson, type InsertLesson,
  userProgress, type UserProgress, type InsertUserProgress,
  chatHistory, type ChatHistory, type InsertChatHistory,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission
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
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetPasswordToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, data: Partial<Omit<User, 'id'>>): Promise<User | undefined>;
  deleteUser(userId: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  getPremiumUserCount(): Promise<number>;
  makeUserAdmin(userId: number): Promise<User | undefined>;
  
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
  getCompletedLessonCount(): Promise<number>;
  
  // Chat History methods
  getChatHistory(userId: number, lessonId: string): Promise<ChatHistory | undefined>;
  saveChatHistory(userId: number, lessonId: string, messages: any[]): Promise<ChatHistory>;
  
  // Contact Submission methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmissionById(id: number): Promise<ContactSubmission | undefined>;
  markContactSubmissionAsResolved(id: number, notes?: string): Promise<ContactSubmission | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private lessons: Map<number, Lesson>;
  private progressRecords: Map<string, UserProgress>;
  private chatHistories: Map<string, ChatHistory>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private userCurrentId: number;
  private languageCurrentId: number;
  private lessonCurrentId: number;
  private progressCurrentId: number;
  private chatHistoryCurrentId: number;
  private contactSubmissionCurrentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.lessons = new Map();
    this.progressRecords = new Map();
    this.chatHistories = new Map();
    this.contactSubmissions = new Map();
    this.userCurrentId = 1;
    this.languageCurrentId = 1;
    this.lessonCurrentId = 1;
    this.progressCurrentId = 1;
    this.chatHistoryCurrentId = 1;
    this.contactSubmissionCurrentId = 1;
    
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

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token
    );
  }
  
  async getUserByResetPasswordToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetPasswordToken === token
    );
  }
  
  async updateUser(userId: number, data: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...data
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: false, 
      subscriptionTier: "free",
      subscriptionExpiry: null,
      emailVerified: insertUser.emailVerified !== undefined ? insertUser.emailVerified : false,
      verificationToken: insertUser.verificationToken || null,
      verificationTokenExpiry: insertUser.verificationTokenExpiry || null,
      resetPasswordToken: insertUser.resetPasswordToken || null,
      resetPasswordTokenExpiry: insertUser.resetPasswordTokenExpiry || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUserCount(): Promise<number> {
    return this.users.size;
  }
  
  async getPremiumUserCount(): Promise<number> {
    return Array.from(this.users.values()).filter(
      user => user.subscriptionTier !== "free"
    ).length;
  }
  
  async makeUserAdmin(userId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      isAdmin: true
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(userId: number): Promise<boolean> {
    // Check if the user exists
    if (!this.users.has(userId)) {
      return false;
    }
    
    try {
      // Delete associated data for the user
      
      // Delete progress records
      Array.from(this.progressRecords.entries()).forEach(([key, progress]) => {
        if (progress.userId === userId) {
          this.progressRecords.delete(key);
        }
      });
      
      // Delete chat histories
      Array.from(this.chatHistories.entries()).forEach(([key, history]) => {
        if (key.startsWith(`${userId}:`)) {
          this.chatHistories.delete(key);
        }
      });
      
      // Finally delete the user
      this.users.delete(userId);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
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
  
  async getCompletedLessonCount(): Promise<number> {
    return Array.from(this.progressRecords.values()).filter(
      progress => progress.completed
    ).length;
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

  // Contact Submission methods
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.contactSubmissionCurrentId++;
    const now = new Date();
    const contactSubmission: ContactSubmission = {
      id,
      ...submission,
      createdAt: now,
      isResolved: false,
      notes: submission.notes || null
    };
    
    this.contactSubmissions.set(id, contactSubmission);
    return contactSubmission;
  }
  
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // newest first
  }
  
  async getContactSubmissionById(id: number): Promise<ContactSubmission | undefined> {
    return this.contactSubmissions.get(id);
  }
  
  async markContactSubmissionAsResolved(id: number, notes?: string): Promise<ContactSubmission | undefined> {
    const submission = this.contactSubmissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission: ContactSubmission = {
      ...submission,
      isResolved: true,
      notes: notes || submission.notes
    };
    
    this.contactSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
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
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user || undefined;
  }
  
  async getUserByResetPasswordToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetPasswordToken, token));
    return user || undefined;
  }
  
  async updateUser(userId: number, data: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result[0]?.count || 0);
  }
  
  async getPremiumUserCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(sql`subscription_tier != 'free'`);
    return Number(result[0]?.count || 0);
  }
  
  async makeUserAdmin(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async deleteUser(userId: number): Promise<boolean> {
    try {
      // First, check if the user exists
      const user = await this.getUser(userId);
      if (!user) {
        return false;
      }
      
      // Start a transaction to ensure data consistency
      await db.transaction(async (tx) => {
        // Delete user progress records
        await tx.delete(userProgress).where(eq(userProgress.userId, userId));
        
        // Delete chat history records
        await tx.delete(chatHistory).where(eq(chatHistory.userId, userId));
        
        // Finally delete the user
        await tx.delete(users).where(eq(users.id, userId));
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
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
  
  async getCompletedLessonCount(): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(userProgress)
      .where(eq(userProgress.completed, true));
    return Number(result[0]?.count || 0);
  }
  
  // Chat History methods
  async getChatHistory(userId: number, lessonId: string): Promise<ChatHistory | undefined> {
    const [history] = await db
      .select()
      .from(chatHistory)
      .where(
        and(
          eq(chatHistory.userId, userId),
          eq(chatHistory.lessonId, lessonId)
        )
      );
    return history;
  }
  
  async saveChatHistory(userId: number, lessonId: string, messages: any[]): Promise<ChatHistory> {
    // Check if a record already exists
    const existingHistory = await this.getChatHistory(userId, lessonId);
    
    if (existingHistory) {
      // Update existing record
      const [updatedHistory] = await db
        .update(chatHistory)
        .set({
          messages,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(chatHistory.userId, userId),
            eq(chatHistory.lessonId, lessonId)
          )
        )
        .returning();
      return updatedHistory;
    } else {
      // Create new record
      const [newHistory] = await db
        .insert(chatHistory)
        .values({
          userId,
          lessonId,
          messages,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newHistory;
    }
  }
  
  // Contact Submission methods
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db
      .insert(contactSubmissions)
      .values({
        ...submission,
        createdAt: new Date(),
        isResolved: false,
        notes: submission.notes || null
      })
      .returning();
    return newSubmission;
  }
  
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(sql`created_at desc`);
  }
  
  async getContactSubmissionById(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    return submission || undefined;
  }
  
  async markContactSubmissionAsResolved(id: number, notes?: string): Promise<ContactSubmission | undefined> {
    const updateData: Partial<ContactSubmission> = { isResolved: true };
    if (notes) updateData.notes = notes;
    
    const [updatedSubmission] = await db
      .update(contactSubmissions)
      .set(updateData)
      .where(eq(contactSubmissions.id, id))
      .returning();
    
    return updatedSubmission;
  }
}

// Use database storage if DATABASE_URL is available, otherwise use memory storage
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
