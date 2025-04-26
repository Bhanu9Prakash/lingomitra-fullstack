import { 
  users, type User, type InsertUser,
  languages, type Language, type InsertLanguage,
  lessons, type Lesson, type InsertLesson 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private lessons: Map<number, Lesson>;
  private userCurrentId: number;
  private languageCurrentId: number;
  private lessonCurrentId: number;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.lessons = new Map();
    this.userCurrentId = 1;
    this.languageCurrentId = 1;
    this.lessonCurrentId = 1;
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

export const storage = new MemStorage();
