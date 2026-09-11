CREATE TABLE `ai_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usage_user_day_kind` ON `ai_usage` (`user_id`,`day`,`kind`);--> statement-breakpoint
CREATE TABLE `learning_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`session_id` text NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `learning_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_user_event` ON `learning_events` (`user_id`,`event_id`);--> statement-breakpoint
CREATE INDEX `learning_session_events` ON `learning_events` (`session_id`,`id`);--> statement-breakpoint
CREATE TABLE `learning_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`activity_id` text NOT NULL,
	`language_code` text NOT NULL,
	`content_version` text NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`last_event_id` text,
	`updated_at` text NOT NULL,
	`due_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_user_activity` ON `learning_sessions` (`user_id`,`activity_id`);--> statement-breakpoint
CREATE TABLE `lesson_drafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`lesson_id` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `draft_user_lesson` ON `lesson_drafts` (`user_id`,`lesson_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `preferences` text DEFAULT '{}' NOT NULL;