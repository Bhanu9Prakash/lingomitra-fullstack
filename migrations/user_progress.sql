-- Create user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS "user_progress" (
  "id" SERIAL,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "lesson_id" TEXT NOT NULL REFERENCES "lessons"("lessonId"),
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMP,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "score" INTEGER,
  "last_accessed_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "time_spent" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  UNIQUE ("user_id", "lesson_id")
);

-- Add index for faster queries by user_id
CREATE INDEX IF NOT EXISTS "idx_user_progress_user_id" ON "user_progress" ("user_id");

-- Add index for faster queries by lesson_id
CREATE INDEX IF NOT EXISTS "idx_user_progress_lesson_id" ON "user_progress" ("lesson_id");