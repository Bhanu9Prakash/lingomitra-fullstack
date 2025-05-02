import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertUserProgressSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

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
    
    // Validate request body
    const progressData = req.body;
    
    // Create or update progress
    const updatedProgress = await storage.updateUserProgress(
      userId,
      lessonId,
      progressData
    );
    
    res.json(updatedProgress);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
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
  try {
    const { lessonId } = req.params;
    const userId = req.user!.id;
    
    // First check if the lesson is already completed
    const existingProgress = await storage.getUserProgress(userId, lessonId);
    
    // If already completed, just return the existing record
    if (existingProgress && existingProgress.completed) {
      return res.json(existingProgress);
    }
    
    // Otherwise, mark as complete
    const progress = await storage.markLessonComplete(userId, lessonId);
    
    res.json(progress);
  } catch (error) {
    console.error("Error marking lesson as complete:", error);
    res.status(500).json({ message: "Failed to mark lesson as complete" });
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