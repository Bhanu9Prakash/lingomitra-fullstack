import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { z } from "zod";

const router = Router();

const completedActivities = ["predict", "practice-1", "practice-2", "practice-3", "transfer", "reflect"] as const;

const learningNotesSchema = z.object({
  version: z.literal(1),
  attempts: z.number().int().min(1).max(100),
  correct: z.number().int().min(0).max(100),
  confidence: z.enum(["again", "soon", "got-it"]),
  weakConcepts: z.array(z.string().trim().min(1).max(180)).max(5),
  completedActivities: z.array(z.enum(completedActivities)),
  review: z.object({
    dueAt: z.string().datetime(),
    concept: z.string().trim().min(1).max(180),
    prompt: z.string().trim().min(1).max(500),
    cue: z.string().trim().min(1).max(700),
    lastRating: z.enum(["again", "soon", "got-it"]).optional(),
  }),
});

const progressUpdateSchema = z.object({
  completed: z.boolean().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  score: z.number().int().min(0).max(100).optional(),
  timeSpent: z.number().int().min(0).max(8 * 60 * 60).optional(),
  notes: z.string().max(16000).optional(),
}).strict();

const reviewRatingSchema = z.object({
  rating: z.enum(["again", "soon", "got-it"]),
});

function lessonNumber(lessonId: string) {
  const match = lessonId.match(/lesson[-_]?0*(\d+)/i);
  return match ? Number(match[1]) : 1;
}

export function hasPaidAccess(user: Express.User) {
  const tier = user.subscriptionTier;
  return Boolean(tier && ["basic", "premium", "pro"].includes(tier) && (!user.subscriptionExpiry || user.subscriptionExpiry > new Date()));
}

export async function assertLessonAccess(req: Request, lessonId: string) {
  const lesson = await storage.getLessonById(lessonId);
  if (!lesson) {
    const error = new Error("Lesson not found");
    (error as Error & { status: number }).status = 404;
    throw error;
  }
  if (lessonNumber(lessonId) > 2 && !hasPaidAccess(req.user!)) {
    const error = new Error("This lesson requires an active subscription.");
    (error as Error & { status: number }).status = 403;
    throw error;
  }
  return lesson;
}

function parseLearningNotes(notes: string | null) {
  if (!notes) return null;
  try {
    return learningNotesSchema.parse(JSON.parse(notes));
  } catch {
    return null;
  }
}

/**
 * Helper middleware for development testing
 * This allows bypassing authentication with ?testUser=1 for development purposes only
 */
const devTestAuthMiddleware = (req: Request, res: Response, next: Function) => {
  // Only for development environment
  if (process.env.NODE_ENV === 'development' && req.query.testUser) {
    const testUserId = parseInt(req.query.testUser as string, 10);
    if (!isNaN(testUserId)) {
      // Mock the authenticated user for testing
      req.user = { id: testUserId } as any;
      return next();
    }
  }
  
  // Normal authentication for production
  isAuthenticated(req, res, next);
};

/**
 * Route guard to check if the user is authenticated
 */
router.use(devTestAuthMiddleware);

/**
 * GET /api/progress/lesson/:lessonId
 * Get user progress for a specific lesson
 */
router.get("/lesson/:lessonId", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.id;

    const progress = await storage.getUserProgress(userId, lessonId);
    
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    
    res.json(progress);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Failed to fetch user progress" });
  }
});

/**
 * GET /api/progress/language/:languageCode
 * Get all user progress for a specific language
 */
router.get("/language/:languageCode", async (req: Request, res: Response) => {
  try {
    const { languageCode } = req.params;
    const userId = req.user!.id;

    const progress = await storage.getUserProgressByLanguage(userId, languageCode);
    
    res.json(progress);
  } catch (error) {
    console.error("Error fetching language progress:", error);
    res.status(500).json({ message: "Failed to fetch language progress" });
  }
});

/**
 * POST /api/progress/lesson/:lessonId
 * Update user progress for a specific lesson
 */
router.post("/lesson/:lessonId", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.id;

    await assertLessonAccess(req, lessonId);
    const progressData = progressUpdateSchema.parse(req.body);
    const learningNotes = progressData.notes ? parseLearningNotes(progressData.notes) : null;

    if (progressData.completed) {
      if (!learningNotes || !completedActivities.every((activity) => learningNotes.completedActivities.includes(activity))) {
        return res.status(400).json({ message: "Finish Predict, all three Practice activities, Transfer, and Reflect before completing this lesson." });
      }
      if (progressData.progress !== 100 || progressData.score === undefined || progressData.timeSpent === undefined) {
        return res.status(400).json({ message: "Completion needs real elapsed time and a checked learning activity." });
      }
    }

    const updatedProgress = await storage.updateUserProgress(
      userId,
      lessonId,
      {
        ...progressData,
        completedAt: progressData.completed ? new Date() : undefined,
      }
    );
    
    res.json(updatedProgress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message || "Invalid progress update." });
    }
    if (error instanceof Error && "status" in error) {
      return res.status((error as Error & { status: number }).status).json({ message: error.message });
    }
    console.error("Error updating user progress:", error);
    res.status(500).json({ message: "Failed to update user progress" });
  }
});

/**
 * POST /api/progress/lesson/:lessonId/complete
 * Mark a lesson as complete
 */
router.post("/lesson/:lessonId/complete", async (req: Request, res: Response) => {
  res.status(400).json({ message: "Lessons are completed from the learning activity after meaningful practice and reflection." });
});

/**
 * GET /api/progress/review/due?language=de
 * A small, transparent queue created from the learner's saved reflections.
 */
router.get("/review/due", async (req: Request, res: Response) => {
  const languageCode = typeof req.query.language === "string" ? req.query.language : "";
  if (!/^[a-z]{2,5}$/i.test(languageCode)) {
    return res.status(400).json({ message: "Choose a valid language for review." });
  }

  try {
    const records = await storage.getUserProgressByLanguage(req.user!.id, languageCode);
    const now = new Date();
    const items = records.flatMap((record) => {
      const notes = parseLearningNotes(record.notes);
      if (!record.completed || !notes || new Date(notes.review.dueAt) > now) return [];
      return [{
        lessonId: record.lessonId,
        concept: notes.review.concept,
        prompt: notes.review.prompt,
        cue: notes.review.cue,
        dueAt: notes.review.dueAt,
        confidence: notes.confidence,
      }];
    }).sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    res.json({ items });
  } catch (error) {
    console.error("Error loading review queue:", error);
    res.status(500).json({ message: "Could not load the review queue." });
  }
});

/**
 * POST /api/progress/review/lesson/:lessonId
 * Again = 1 day, Soon = 3 days, Got it = 14 days. These intervals are shown
 * in the interface and deliberately stay conservative.
 */
router.post("/review/lesson/:lessonId", async (req: Request, res: Response) => {
  try {
    const { rating } = reviewRatingSchema.parse(req.body);
    const record = await storage.getUserProgress(req.user!.id, req.params.lessonId);
    const notes = record ? parseLearningNotes(record.notes) : null;
    if (!record || !notes) {
      return res.status(404).json({ message: "No saved review item was found for this lesson." });
    }
    const delayDays = { again: 1, soon: 3, "got-it": 14 }[rating];
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + delayDays);
    const updatedNotes = {
      ...notes,
      confidence: rating,
      review: { ...notes.review, dueAt: dueAt.toISOString(), lastRating: rating },
    };
    const progress = await storage.updateUserProgress(req.user!.id, req.params.lessonId, {
      notes: JSON.stringify(updatedNotes),
      lastAccessedAt: new Date(),
    });
    res.json({ progress, nextReviewAt: dueAt.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message || "Invalid review choice." });
    }
    console.error("Error saving review choice:", error);
    res.status(500).json({ message: "Could not save the review choice." });
  }
});

/**
 * DELETE /api/progress/language/:languageCode/reset
 * Reset all progress for a language
 */
router.delete("/language/:languageCode/reset", async (req: Request, res: Response) => {
  try {
    const { languageCode } = req.params;
    const userId = req.user!.id;
    
    // Get the lessons for this language
    const languageLessons = await storage.getLessonsByLanguage(languageCode);
    
    if (!languageLessons.length) {
      return res.status(404).json({ message: "No lessons found for this language" });
    }
    
    // Delete all progress records for this user and language
    const result = await storage.resetLanguageProgress(userId, languageCode);
    
    res.json({ 
      message: `Progress reset for ${languageCode}`, 
      count: result
    });
  } catch (error) {
    console.error("Error resetting language progress:", error);
    res.status(500).json({ message: "Failed to reset language progress" });
  }
});

export default router;