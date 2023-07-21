CREATE TABLE `musicGenre_album` (
	`musicGenre_id` text NOT NULL,
	`album_id` text NOT NULL,
	PRIMARY KEY(`album_id`, `musicGenre_id`),
	FOREIGN KEY (`musicGenre_id`) REFERENCES `musicGenres`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade
);
