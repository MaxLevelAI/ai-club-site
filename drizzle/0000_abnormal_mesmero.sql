CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`session_key` text NOT NULL,
	`registered_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_session_key_unique` ON `registrations` (`session_key`);--> statement-breakpoint
CREATE INDEX `idx_registrations_registered_at` ON `registrations` (`registered_at`);