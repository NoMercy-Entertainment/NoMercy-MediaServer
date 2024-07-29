CREATE TABLE `music_plays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`track_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `music_plays_index` ON `music_plays` (`track_id`,`user_id`);