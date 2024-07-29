CREATE TABLE `album_user` (
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`album_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`album_id`, `user_id`),
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
