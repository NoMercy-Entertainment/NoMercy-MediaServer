CREATE TABLE sqlitestudio_temp_table AS SELECT * FROM medias;--> statement-breakpoint

DROP TABLE medias;--> statement-breakpoint

CREATE TABLE medias (
	`id` text PRIMARY KEY,
	`aspectRatio` real,
	`height` integer,
	`iso6391` text,
	`name` text,
	`site` text,
	`size` integer,
	`src` text NOT NULL,
	`type` text NOT NULL,
	`voteAverage` real,
	`voteCount` integer,
	`width` integer,
	`colorPalette` text,
	`blurHash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`tv_id` integer,
	`season_id` integer,
	`episode_id` integer,
	`movie_id` integer,
	`person_id` integer,
	`videoFile_id` integer,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`videoFile_id`) REFERENCES `videoFiles`(`id`) ON UPDATE cascade ON DELETE cascade
);--> statement-breakpoint

INSERT INTO medias (`id`, `aspectRatio`, `height`, `iso6391`, `name`, `site`, `size`, `src`, `type`, `voteAverage`, `voteCount`, `width`, `colorPalette`, `blurHash`, `created_at`, `updated_at`, `tv_id`, `season_id`, `episode_id`, `movie_id`, `person_id`, `videoFile_id`) SELECT `id`, `aspectRatio`, `height`, `iso6391`, `name`, `site`, `size`, `src`, `type`, `voteAverage`, `voteCount`, `width`, `colorPalette`, `blurHash`, `created_at`, `updated_at`, `tv_id`, `season_id`, `episode_id`, `movie_id`, `person_id`, `videoFile_id` FROM sqlitestudio_temp_table;--> statement-breakpoint


DROP TABLE sqlitestudio_temp_table;--> statement-breakpoint

CREATE TABLE sqlitestudio_temp_table AS SELECT * FROM images;--> statement-breakpoint

DROP TABLE images;--> statement-breakpoint

CREATE TABLE images (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`aspectRatio` real,
	`height` integer,
	`iso6391` text,
	`name` text,
	`site` text,
	`size` integer,
	`filePath` text NOT NULL,
	`type` text NOT NULL,
	`width` integer,
	`voteAverage` real,
	`voteCount` integer,
	`colorPalette` text,
	`blurHash` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`cast_id` text,
	`crew_id` text,
	`person_id` integer,
	`artist_id` text,
	`album_id` text,
	`track_id` text,
	`tv_id` integer,
	`season_id` integer,
	`episode_id` integer,
	`movie_id` integer,
	`collection_id` integer,
	FOREIGN KEY (`cast_id`) REFERENCES `casts`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`crew_id`) REFERENCES `crews`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade
);--> statement-breakpoint

INSERT INTO images (`id`,`aspectRatio`,`height`,`iso6391`,`name`,`site`,`size`,`filePath`,`type`,`width`,`voteAverage`,`voteCount`,`colorPalette`,`blurHash`,`created_at`,`updated_at`,`cast_id`,`crew_id`,`person_id`,`artist_id`,`album_id`,`track_id`,`tv_id`,`season_id`,`episode_id`,`movie_id`,`collection_id`) SELECT `id`,`aspectRatio`,`height`,`iso6391`,`name`,`site`,`size`,`filePath`,`type`,`width`,`voteAverage`,`voteCount`,`colorPalette`,`blurHash`,`created_at`,`updated_at`,`cast_id`,`crew_id`,`person_id`,`artist_id`,`album_id`,`track_id`,`tv_id`,`season_id`,`episode_id`,`movie_id`,`collection_id` FROM sqlitestudio_temp_table;--> statement-breakpoint

DROP TABLE sqlitestudio_temp_table;
