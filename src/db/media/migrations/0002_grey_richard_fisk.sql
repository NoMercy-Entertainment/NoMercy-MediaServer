/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/

DROP TABLE `artist_track`;
--> statement-breakpoint
CREATE TABLE `artist_track` (
	`artist_id` text NOT NULL,
	`track_id` text NOT NULL,
	PRIMARY KEY(`artist_id`, `track_id`),
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);