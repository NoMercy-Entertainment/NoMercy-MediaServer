/*
 SQLite does not support "Changing existing column type" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/

DROP TABLE `albums`;
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`folder` text,
	`cover` text,
	`country` text,
	`year` text,
	`tracks` text,
	`colorPalette` text,
	`blurHash` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`library_id` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `album_id_index` ON `albums` (`id`);