CREATE TABLE `artist_user` (
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`artist_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`artist_id`, `user_id`),
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
