CREATE TABLE `musicGenre_artist` (
	`musicGenre_id` text NOT NULL,
	`artist_id` text NOT NULL,
	PRIMARY KEY(`artist_id`, `musicGenre_id`),
	FOREIGN KEY (`musicGenre_id`) REFERENCES `musicGenres`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade
);
