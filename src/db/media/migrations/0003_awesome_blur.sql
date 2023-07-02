CREATE TABLE `library_track` (
	`library_id` text NOT NULL,
	`track_id` text NOT NULL,
	PRIMARY KEY(`library_id`, `track_id`),
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE tracks ADD `folder_id` text REFERENCES folders(id);