CREATE TABLE `learning_exposures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`language_code` text NOT NULL,
	`material_key` text NOT NULL,
	`source` text NOT NULL,
	`seen_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exposures_user_language_key` ON `learning_exposures` (`user_id`,`language_code`,`material_key`);--> statement-breakpoint
CREATE INDEX `exposures_user_language` ON `learning_exposures` (`user_id`,`language_code`);--> statement-breakpoint
CREATE TABLE `learning_requests` (
	`user_id` integer NOT NULL,
	`request_id` text NOT NULL,
	`resource` text NOT NULL,
	`status` text NOT NULL,
	`response` text,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `request_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `lesson_drafts` ADD `last_request_id` text;