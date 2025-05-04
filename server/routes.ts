import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { insertLanguageSchema, insertLessonSchema } from "@shared/schema";
import { readAllLessons } from "./utils";
import chatRouter from "./routes/chat";
import progressRouter from "./routes/progress";
import contactRouter from "./routes/contact";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { WebSocketServer, WebSocket } from 'ws';

// Sample data
const languages = [
  {
    code: "de",
    name: "German",
    flagCode: "de",
    speakers: 135,
    isAvailable: true,
  },
  {
    code: "es",
    name: "Spanish",
    flagCode: "es",
    speakers: 460,
    isAvailable: true,
  },
  {
    code: "fr",
    name: "French",
    flagCode: "fr",
    speakers: 275,
    isAvailable: true,
  },
  {
    code: "hi",
    name: "Hindi",
    flagCode: "hi",
    speakers: 600,
    isAvailable: true,
  },
  {
    code: "zh",
    name: "Chinese",
    flagCode: "zh",
    speakers: 1300,
    isAvailable: true,
  },
  {
    code: "ja",
    name: "Japanese",
    flagCode: "jp",
    speakers: 126,
    isAvailable: true,
  },
  {
    code: "kn",
    name: "Kannada",
    flagCode: "kn", // Using 'in-kn' for Karnataka state in India
    speakers: 45,
    isAvailable: true,
  },
];

const germanLessons = [
  {
    lessonId: "de-introduction",
    languageCode: "de",
    title: "Introduction to German",
    content: `# Introduction to German

## Learning Objectives
- Understand basic facts about the German language
- Learn about German-speaking countries
- Recognize the importance of German globally

## About the German Language
German (Deutsch) is a West Germanic language mainly spoken in Central Europe. It is the most widely spoken and official or co-official language in Germany, Austria, Switzerland, Liechtenstein, and parts of Belgium, Italy, and Luxembourg.

## German-Speaking Countries
The following countries have German as an official language:

- Germany (Deutschland)
- Austria (Österreich)
- Switzerland (Schweiz)
- Liechtenstein (Liechtenstein)
- Luxembourg (Luxemburg) - as one of the official languages
- Belgium (Belgien) - in certain regions

## Importance of German
- Approximately 135 million people speak German worldwide
- German is the most widely spoken native language in the European Union
- Germany has the largest economy in Europe and is a major trading partner
- German-speaking countries are leaders in science, engineering, and philosophy

## What to Expect
In the upcoming lessons, you'll learn:
- The German alphabet and pronunciation
- Basic greetings and introductions
- Numbers and counting
- Essential vocabulary and phrases
- Grammar fundamentals

Remember, language learning is a journey! Take your time and practice regularly.
`,
    orderIndex: 1,
  },
  {
    lessonId: "de-lesson-2",
    languageCode: "de",
    title: "German Alphabet and Pronunciation",
    content: `# German Alphabet and Pronunciation

## Learning Objectives
- Learn the German alphabet
- Understand special characters (umlauts and ß)
- Practice basic pronunciation rules

## The German Alphabet
The German alphabet consists of the 26 standard Latin alphabet letters plus the following special characters:

- Ä (ä) - pronounced similar to the 'e' in "bed"
- Ö (ö) - pronounced similar to the 'i' in "bird" 
- Ü (ü) - pronounced like 'ee' but with rounded lips
- ß (Eszett or sharp S) - pronounced like a double 's'

## Pronunciation Guide

### Vowels
| Letter | Pronunciation | Example |
|--------|---------------|---------|
| A, a | like 'a' in "father" | Haus (house) |
| E, e | like 'e' in "bet" | Bett (bed) |
| I, i | like 'ee' in "see" | Bitte (please) |
| O, o | like 'o' in "more" | Sonne (sun) |
| U, u | like 'oo' in "moon" | Mut (courage) |

### Consonants
Most German consonants are similar to English, with some differences:

| Letter | Pronunciation | Example |
|--------|---------------|---------|
| B, b | like English 'b' at beginning, 'p' at end | Buch (book) |
| Ch, ch | like 'h' in "huge" or Scottish "loch" | Ich (I) |
| J, j | like 'y' in "yes" | Ja (yes) |
| R, r | guttural sound from back of throat | Rot (red) |
| V, v | like English 'f' | Vater (father) |
| W, w | like English 'v' | Wasser (water) |
| Z, z | like 'ts' in "bits" | Zeit (time) |

## Practice Exercise
Try to pronounce these words:

1. Buch (book)
2. Schön (beautiful)
3. Tür (door)
4. Straße (street)
5. Zwölf (twelve)

## Key Points
- German is generally pronounced as it is written
- Pay special attention to umlauts (ä, ö, ü) and ß
- German 'r' is different from English 'r'
- 'ch' has two different pronunciations depending on the preceding vowel

Practice your pronunciation regularly to develop a good German accent!
`,
    orderIndex: 2,
  },
  {
    lessonId: "de-lesson-3",
    languageCode: "de",
    title: "Basic Greetings and Introductions",
    content: `# Basic Greetings and Introductions

## Learning Objectives
- Learn common German greetings for different times of day
- Practice introducing yourself in German
- Master basic conversation starters

## Greetings
Let's start with some common German greetings:

| German | English | Usage |
|--------|---------|-------|
| Hallo | Hello | Universal greeting, anytime |
| Guten Morgen | Good morning | Until around 11:00 AM |
| Guten Tag | Good day | From late morning to early evening |
| Guten Abend | Good evening | Evening to night |
| Auf Wiedersehen | Goodbye | Formal farewell |
| Tschüss | Bye | Informal farewell |

## Introducing Yourself
Here's how to introduce yourself in German:

**Ich heiße** [your name]. - My name is [your name].
**Ich bin** [your name]. - I am [your name].

You can ask someone else's name with:

**Wie heißen Sie?** - What is your name? (formal)
**Wie heißt du?** - What is your name? (informal)

## Practice Exercise
Complete the following conversation:

Person A: Guten Tag! Ich heiße Maria. Wie _____ du?
Person B: Hallo Maria! Ich _____ Thomas.
Person A: Freut mich, Thomas! Wie _____ es dir?
Person B: Mir geht es _____. Und dir?

Answers:
1. heißt
2. bin / heiße
3. geht
4. gut

## Key Points
- German greetings change based on time of day
- The formal "Sie" vs. informal "du" is important in German culture
- Practice these phrases daily to memorize them
`,
    orderIndex: 3,
  },
  {
    lessonId: "de-lesson-4",
    languageCode: "de",
    title: "Numbers and Counting",
    content: `# Numbers and Counting

## Learning Objectives
- Learn the numbers 0-20 in German
- Understand the pattern for forming larger numbers
- Practice counting and using numbers in context

## Numbers 0-20
Let's begin with the basics:

| Number | German |
|--------|--------|
| 0 | null |
| 1 | eins |
| 2 | zwei |
| 3 | drei |
| 4 | vier |
| 5 | fünf |
| 6 | sechs |
| 7 | sieben |
| 8 | acht |
| 9 | neun |
| 10 | zehn |
| 11 | elf |
| 12 | zwölf |
| 13 | dreizehn |
| 14 | vierzehn |
| 15 | fünfzehn |
| 16 | sechzehn |
| 17 | siebzehn |
| 18 | achtzehn |
| 19 | neunzehn |
| 20 | zwanzig |

## Tens and Beyond
For numbers 21-99, German uses a unique structure:

| Number | German | Structure |
|--------|--------|-----------|
| 21 | einundzwanzig | one-and-twenty |
| 22 | zweiundzwanzig | two-and-twenty |
| 30 | dreißig | thirty |
| 35 | fünfunddreißig | five-and-thirty |
| 42 | zweiundvierzig | two-and-forty |
| 50 | fünfzig | fifty |
| 99 | neunundneunzig | nine-and-ninety |

Notice that the ones digit comes first, followed by "und" (and), and then the tens digit.

## Hundreds and Thousands
| Number | German |
|--------|--------|
| 100 | (ein)hundert |
| 200 | zweihundert |
| 1,000 | (ein)tausend |
| 2,000 | zweitausend |

## Practice Exercise
Write these numbers in German:
1. 7
2. 14
3. 23
4. 38
5. 72
6. 100
7. 125
8. 1,999

Answers:
1. sieben
2. vierzehn
3. dreiundzwanzig
4. achtunddreißig
5. zweiundsiebzig
6. hundert
7. hundertfünfundzwanzig
8. tausendneunhundertneunundneunzig

## Using Numbers in Context

Here are some useful phrases:
- Ich bin ___ Jahre alt. (I am ___ years old.)
- Meine Telefonnummer ist ___. (My phone number is ___.)
- Das kostet ___ Euro. (That costs ___ euros.)

## Key Points
- German numbers follow specific patterns
- Remember the "ones-and-tens" structure for numbers 21-99
- Practice counting regularly, especially the teens and tens
`,
    orderIndex: 4,
  },
  {
    lessonId: "de-lesson-5",
    languageCode: "de",
    title: "Common Phrases for Travelers",
    content: `# Common Phrases for Travelers

## Learning Objectives
- Learn essential phrases for traveling in German-speaking countries
- Master basic expressions for restaurants, hotels, and public transportation
- Build confidence for real-world interactions

## Getting Help
| German | English |
|--------|---------|
| Entschuldigung | Excuse me |
| Sprechen Sie Englisch? | Do you speak English? |
| Ich verstehe nicht | I don't understand |
| Bitte sprechen Sie langsamer | Please speak more slowly |
| Können Sie mir helfen? | Can you help me? |
| Wie sagt man ___ auf Deutsch? | How do you say ___ in German? |

## At the Restaurant
| German | English |
|--------|---------|
| Einen Tisch für ___ Personen, bitte | A table for ___ people, please |
| Die Speisekarte, bitte | The menu, please |
| Ich möchte bestellen | I would like to order |
| Das schmeckt sehr gut | This tastes very good |
| Die Rechnung, bitte | The bill, please |
| Trinkgeld | Tip |

## At the Hotel
| German | English |
|--------|---------|
| Ich habe eine Reservierung | I have a reservation |
| Ein Zimmer für ___ Nächte, bitte | A room for ___ nights, please |
| Haben Sie WLAN? | Do you have WiFi? |
| Wann ist das Frühstück? | When is breakfast? |
| Wo ist der Aufzug? | Where is the elevator? |
| Um wie viel Uhr ist Check-out? | What time is check-out? |

## Transportation
| German | English |
|--------|---------|
| Wo ist der Bahnhof? | Where is the train station? |
| Eine Fahrkarte nach ___, bitte | A ticket to ___, please |
| Einfach oder hin und zurück? | One-way or round trip? |
| Wann fährt der nächste Zug? | When does the next train leave? |
| Wie komme ich zum/zur ___? | How do I get to the ___? |
| Ist das weit? | Is it far? |

## Emergencies
| German | English |
|--------|---------|
| Hilfe! | Help! |
| Notruf: 112 | Emergency number: 112 |
| Ich brauche einen Arzt | I need a doctor |
| Gibt es ein Krankenhaus in der Nähe? | Is there a hospital nearby? |
| Ich habe meine/n ___ verloren | I've lost my ___ |
| Polizei | Police |

## Practice Exercise
Match the German phrase to the appropriate situation:

1. "Die Rechnung, bitte"
2. "Eine Fahrkarte nach Berlin, bitte"
3. "Sprechen Sie Englisch?"
4. "Ich habe eine Reservierung"
5. "Wie komme ich zum Bahnhof?"

Situations:
A. Checking into a hotel
B. At a train station
C. When paying at a restaurant
D. When you're lost
E. When you need help in English

Answers: 1-C, 2-B, 3-E, 4-A, 5-D

## Key Points
- Learn these phrases to make your travel experience smoother
- Practice pronunciation before your trip
- Most Germans in tourist areas speak some English, but locals appreciate when visitors try to speak German
- Keep a small phrasebook or translation app handy for emergencies
`,
    orderIndex: 5,
  },
];

const spanishLessons = [
  {
    lessonId: "es-introduction",
    languageCode: "es",
    title: "Introduction to Spanish",
    content: `# Introduction to Spanish

## Learning Objectives
- Understand basic facts about the Spanish language
- Learn about Spanish-speaking countries
- Recognize the importance of Spanish globally

## About the Spanish Language
Spanish (español) is a Romance language that originated in the Iberian Peninsula of Europe. Today, it is spoken by more than 460 million people worldwide, making it the world's second-most spoken native language after Mandarin Chinese.

## Spanish-Speaking Countries
Spanish is the official language in 21 countries:

- Spain (España)
- Mexico (México)
- Colombia (Colombia)
- Argentina (Argentina)
- Peru (Perú)
- Venezuela (Venezuela)
- Chile (Chile)
- Ecuador (Ecuador)
- Guatemala (Guatemala)
- Cuba (Cuba)
- Bolivia (Bolivia)
- Dominican Republic (República Dominicana)
- Honduras (Honduras)
- Paraguay (Paraguay)
- El Salvador (El Salvador)
- Nicaragua (Nicaragua)
- Costa Rica (Costa Rica)
- Panama (Panamá)
- Puerto Rico (Puerto Rico)
- Uruguay (Uruguay)
- Equatorial Guinea (Guinea Ecuatorial)

## Importance of Spanish
- Spanish is the second most spoken language by native speakers worldwide
- It's an official language of the United Nations and other international organizations
- Spanish-speaking countries have rich cultural heritages that influence art, literature, music, and cuisine globally
- Knowledge of Spanish provides access to a wealth of literature, film, and music

## What to Expect
In the upcoming lessons, you'll learn:
- Spanish pronunciation and the alphabet
- Basic greetings and introductions
- Essential vocabulary and phrases
- Grammar fundamentals
- Cultural aspects of Spanish-speaking countries

Remember, consistency is key to learning any language. ¡Buena suerte! (Good luck!)
`,
    orderIndex: 1,
  },
];

const frenchLessons = [
  {
    lessonId: "fr-introduction",
    languageCode: "fr",
    title: "Introduction to French",
    content: `# Introduction to French

## Learning Objectives
- Understand basic facts about the French language
- Learn about French-speaking countries (La Francophonie)
- Recognize the importance of French globally

## About the French Language
French (français) is a Romance language of Indo-European origin. It descended from the Vulgar Latin of the Roman Empire, as did all Romance languages. French evolved from Gallo-Romance, the Latin spoken in Gaul, and more specifically in Northern Gaul.

## French-Speaking Countries
French is the official language in 29 countries, including:

- France (France)
- Canada (especially Quebec)
- Belgium (along with Dutch and German)
- Switzerland (along with German, Italian, and Romansh)
- Luxembourg (along with Luxembourgish and German)
- Monaco
- Many African countries, including:
  - Senegal
  - Côte d'Ivoire (Ivory Coast)
  - Mali
  - Guinea
  - Democratic Republic of the Congo
  - Cameroon
  - and many others

## Importance of French
- Approximately 275 million people speak French worldwide
- It's an official language of many international organizations including the UN, EU, NATO, and the International Olympic Committee
- France has a major influence on art, cuisine, science, and fashion
- French is considered one of the most romantic languages and is known as "the language of love"

## What to Expect
In the upcoming lessons, you'll learn:
- French pronunciation and accent marks
- Basic greetings and introductions
- Essential vocabulary for everyday conversation
- Grammar fundamentals
- Cultural aspects of French-speaking regions

Remember, learning French opens doors to a rich cultural heritage and improved career opportunities. Bonne chance! (Good luck!)
`,
    orderIndex: 1,
  },
];

const chineseLessons = [
  {
    lessonId: "zh-introduction",
    languageCode: "zh",
    title: "Introduction to Chinese",
    content: `# Introduction to Chinese

## Learning Objectives
- Understand basic facts about the Chinese language
- Learn about Chinese-speaking regions
- Recognize the importance of Chinese globally

## About the Chinese Language
Chinese (中文, Zhōngwén) is a group of language varieties that form the Sinitic branch of the Sino-Tibetan language family. Mandarin Chinese (普通话, Pǔtōnghuà) is the most widely spoken form and serves as the standard language of China.

## Chinese-Speaking Regions
Chinese is spoken primarily in:

- People's Republic of China (中华人民共和国)
- Taiwan (台湾)
- Singapore (新加坡)
- Malaysia (马来西亚)
- Various Chinese communities worldwide

## Importance of Chinese
- With over 1.3 billion native speakers, Chinese is the most spoken language in the world
- China has the world's second-largest economy and is a major global trade partner
- Chinese culture has profoundly influenced East Asia and beyond through its art, literature, philosophy, and cuisine
- Proficiency in Chinese provides significant advantages in international business and diplomacy

## What to Expect
In the upcoming lessons, you'll learn:
- Chinese characters and their components
- The four tones of Mandarin Chinese
- Basic greetings and introductions
- Essential vocabulary for everyday conversation
- Cultural aspects of Chinese-speaking regions

Remember, while Chinese might seem challenging at first due to its characters and tones, consistent practice will lead to steady progress. 加油! (Jiā yóu! - Keep going!)
`,
    orderIndex: 1,
  },
];

const japaneseLessons = [
  {
    lessonId: "ja-introduction",
    languageCode: "ja",
    title: "Introduction to Japanese",
    content: `# Introduction to Japanese

## Learning Objectives
- Understand basic facts about the Japanese language
- Learn about Japan and its culture
- Recognize the importance of Japanese globally

## About the Japanese Language
Japanese (日本語, Nihongo) is an East Asian language spoken primarily in Japan. It is a member of the Japonic language family with a complex writing system that consists of three scripts: hiragana, katakana, and kanji.

## Japanese-Speaking Regions
Japanese is spoken primarily in:

- Japan (日本, Nihon/Nippon)
- Japanese communities around the world, particularly in Brazil, the United States, and Peru

## Importance of Japanese
- Around 126 million people speak Japanese worldwide
- Japan has the world's third-largest economy and is a leader in technology, automotive, and entertainment industries
- Japanese culture has gained global popularity through anime, manga, video games, cuisine, and traditional arts
- Knowledge of Japanese opens doors to academic and professional opportunities in various fields

## What to Expect
In the upcoming lessons, you'll learn:
- The Japanese writing system (hiragana, katakana, and kanji)
- Basic pronunciation rules
- Essential greetings and expressions
- Fundamental grammar structures
- Cultural aspects that influence language use

Remember, while Japanese has unique features like its writing system and grammar, a consistent learning approach makes it accessible and enjoyable. がんばって! (Ganbatte! - Do your best!)
`,
    orderIndex: 1,
  },
];

const hindiLessons = [
  {
    lessonId: "hi-introduction",
    languageCode: "hi",
    title: "Introduction to Hindi",
    content: `# Introduction to Hindi

## Learning Objectives
- Understand basic facts about the Hindi language
- Learn about Hindi-speaking regions
- Recognize the importance of Hindi globally

## About the Hindi Language
Hindi (हिन्दी) is an Indo-Aryan language spoken primarily in India. It is written in the Devanagari script and is one of the 22 scheduled languages of India. Hindi, along with English, serves as the official language of the Indian government.

## Hindi-Speaking Regions
Hindi is widely spoken in:

- India (भारत), particularly in the "Hindi Belt" regions including:
  - Uttar Pradesh
  - Madhya Pradesh
  - Rajasthan
  - Bihar
  - Delhi
  - Haryana
  - Himachal Pradesh
  - Uttarakhand
  - Jharkhand
  - Chhattisgarh
- Fiji, Mauritius, Trinidad and Tobago, Guyana, and Suriname also have significant Hindi-speaking populations

## Importance of Hindi
- Hindi is spoken by approximately 600 million people worldwide
- It's the third most spoken language in the world by number of native speakers
- Hindi is central to India's rich cultural heritage of literature, poetry, film, and music
- Knowledge of Hindi provides deeper insights into Indian philosophy, spirituality, and traditions

## What to Expect
In the upcoming lessons, you'll learn:
- The Devanagari script and pronunciation
- Basic greetings and introductions
- Essential vocabulary for everyday conversation
- Fundamental grammar structures
- Cultural insights into Indian society

Remember, learning Hindi opens doors to understanding one of the world's oldest and richest civilizations. शुभकामनाएँ! (Shubhkamnayein! - Best wishes!)
`,
    orderIndex: 1,
  },
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Initialize data
  // Add languages
  for (const language of languages) {
    try {
      const validatedLanguage = insertLanguageSchema.parse(language);
      await storage.createLanguage(validatedLanguage);
    } catch (error) {
      console.error("Error adding language:", error);
    }
  }

  // Define the path to the courses directory
  const coursesDir = path.join(process.cwd(), "server", "courses");

  try {
    console.log(`Loading lessons from ${coursesDir}`);

    // Get language codes from initialized languages
    const languageCodes = languages.map((lang) => lang.code);

    // Check if the courses directory exists, create it if it doesn't
    try {
      await fs.access(coursesDir);
    } catch (error) {
      console.log("Courses directory does not exist, creating it...");
      await fs.mkdir(coursesDir, { recursive: true });
    }

    // First, try to load lessons from the filesystem
    const lessons = await readAllLessons(coursesDir, languageCodes);

    // If no lessons were found in the filesystem, use the hardcoded ones
    if (lessons.length === 0) {
      console.log(
        "No lessons found in the filesystem, using hardcoded lessons",
      );

      // Add German lessons
      for (const lesson of germanLessons) {
        try {
          // Check if the lesson already exists
          const existingLesson = await storage.getLessonById(lesson.lessonId);
          if (!existingLesson) {
            const validatedLesson = insertLessonSchema.parse(lesson);
            await storage.createLesson(validatedLesson);
          } else {
            console.log(`Lesson ${lesson.lessonId} already exists, skipping`);
          }
        } catch (error) {
          console.error("Error adding German lesson:", error);
        }
      }

      // Add Spanish lessons
      for (const lesson of spanishLessons) {
        try {
          // Check if the lesson already exists
          const existingLesson = await storage.getLessonById(lesson.lessonId);
          if (!existingLesson) {
            const validatedLesson = insertLessonSchema.parse(lesson);
            await storage.createLesson(validatedLesson);
          } else {
            console.log(`Lesson ${lesson.lessonId} already exists, skipping`);
          }
        } catch (error) {
          console.error("Error adding Spanish lesson:", error);
        }
      }

      // Add French lessons
      for (const lesson of frenchLessons) {
        try {
          // Check if the lesson already exists
          const existingLesson = await storage.getLessonById(lesson.lessonId);
          if (!existingLesson) {
            const validatedLesson = insertLessonSchema.parse(lesson);
            await storage.createLesson(validatedLesson);
          } else {
            console.log(`Lesson ${lesson.lessonId} already exists, skipping`);
          }
        } catch (error) {
          console.error("Error adding French lesson:", error);
        }
      }

      // Add Chinese lessons
      for (const lesson of chineseLessons) {
        try {
          // Check if the lesson already exists
          const existingLesson = await storage.getLessonById(lesson.lessonId);
          if (!existingLesson) {
            const validatedLesson = insertLessonSchema.parse(lesson);
            await storage.createLesson(validatedLesson);
          } else {
            console.log(`Lesson ${lesson.lessonId} already exists, skipping`);
          }
        } catch (error) {
          console.error("Error adding Chinese lesson:", error);
        }
      }

      // Add Japanese lessons
      for (const lesson of japaneseLessons) {
        try {
          // Check if the lesson already exists
          const existingLesson = await storage.getLessonById(lesson.lessonId);
          if (!existingLesson) {
            const validatedLesson = insertLessonSchema.parse(lesson);
            await storage.createLesson(validatedLesson);
          } else {
            console.log(`Lesson ${lesson.lessonId} already exists, skipping`);
          }
        } catch (error) {
          console.error("Error adding Japanese lesson:", error);
        }
      }

      // Add Hindi lessons
      for (const lesson of hindiLessons) {
        try {
          // Check if the lesson already exists
          const existingLesson = await storage.getLessonById(lesson.lessonId);
          if (!existingLesson) {
            const validatedLesson = insertLessonSchema.parse(lesson);
            await storage.createLesson(validatedLesson);
          } else {
            console.log(`Lesson ${lesson.lessonId} already exists, skipping`);
          }
        } catch (error) {
          console.error("Error adding Hindi lesson:", error);
        }
      }
    } else {
      console.log(`Loaded ${lessons.length} lessons from the filesystem`);

      // Add lessons from the filesystem
      for (const lesson of lessons) {
        try {
          // Check if the lesson already exists
          const existingLesson = await storage.getLessonById(lesson.lessonId);
          if (!existingLesson) {
            const validatedLesson = insertLessonSchema.parse(lesson);
            await storage.createLesson(validatedLesson);
          } else {
            console.log(`Lesson ${lesson.lessonId} already exists, skipping`);
          }
        } catch (error) {
          console.error(`Error adding lesson ${lesson.lessonId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error loading lessons:", error);
  }

  // Admin routes - protected by isAdmin middleware
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      console.log("Fetching all users from database");
      const users = await storage.getAllUsers();
      console.log(`Retrieved ${users.length} users from database`);
      
      // Don't send passwords to the client
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/analytics", isAdmin, async (req, res) => {
    try {
      // Get counts for analytics dashboard
      const userCount = await storage.getUserCount();
      const lessonCount = await storage.getAllLessons().then(lessons => lessons.length);
      const languages = await storage.getAllLanguages();
      const completedLessonCount = await storage.getCompletedLessonCount();
      const premiumUserCount = await storage.getPremiumUserCount();
      
      res.json({
        userCount,
        lessonCount,
        languageCount: languages.length,
        completedLessonCount,
        premiumUserCount
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  app.post("/api/admin/make-admin", isAdmin, async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.makeUserAdmin(Number(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Get all contact form submissions
  app.get("/api/admin/contact-submissions", isAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });
  
  // Mark a contact submission as resolved
  app.post("/api/admin/contact-submissions/:id/resolve", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }
      
      const updatedSubmission = await storage.markContactSubmissionAsResolved(id, notes);
      
      if (!updatedSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error resolving contact submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Regular API routes
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getAllLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.get("/api/languages/:code", async (req, res) => {
    try {
      const language = await storage.getLanguageByCode(req.params.code);
      if (!language) {
        return res.status(404).json({ message: "Language not found" });
      }
      res.json(language);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch language" });
    }
  });

  app.get("/api/languages/:code/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByLanguage(req.params.code);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLessonById(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Register chat API router
  app.use("/api/chat", chatRouter);
  app.use("/api/progress", progressRouter);
  app.use("/api/contact", contactRouter);

  const httpServer = createServer(app);
  
  // Create WebSocket server on a distinct path so it doesn't conflict with Vite's HMR websocket
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to LingoMitra WebSocket server'
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
      
      try {
        const parsedMessage = JSON.parse(message.toString());
        
        // Echo back the message
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'echo',
            message: parsedMessage,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        // Send error response
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  console.log('WebSocket server is running on path /ws');

  return httpServer;
}
