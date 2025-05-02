-- Create the chat_history table
CREATE TABLE IF NOT EXISTS "chat_history" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "lesson_id" TEXT NOT NULL REFERENCES "lessons"("lesson_id"),
  "messages" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);