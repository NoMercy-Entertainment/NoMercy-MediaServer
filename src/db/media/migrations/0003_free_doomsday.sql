ALTER TABLE `musicGenre_artist` RENAME TO `album_musicGenre`;--> statement-breakpoint
ALTER TABLE `musicGenre_album` RENAME TO `artist_musicGenre`;--> statement-breakpoint
ALTER TABLE `album_musicGenre` RENAME COLUMN `artist_id` TO `album_id`;--> statement-breakpoint
ALTER TABLE `artist_musicGenre` RENAME COLUMN `album_id` TO `artist_id`;
