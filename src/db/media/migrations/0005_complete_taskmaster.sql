DROP INDEX IF EXISTS `medias_index`;--> statement-breakpoint
CREATE UNIQUE INDEX `medias_tv_unique` ON `medias` (`tv_id`,`src`);--> statement-breakpoint
CREATE UNIQUE INDEX `medias_season_unique` ON `medias` (`season_id`,`src`);--> statement-breakpoint
CREATE UNIQUE INDEX `medias_episode_unique` ON `medias` (`episode_id`,`src`);--> statement-breakpoint
CREATE UNIQUE INDEX `medias_movie_unique` ON `medias` (`movie_id`,`src`);--> statement-breakpoint
CREATE UNIQUE INDEX `medias_person_unique` ON `medias` (`person_id`,`src`);--> statement-breakpoint
CREATE UNIQUE INDEX `medias_videoFile_unique` ON `medias` (`videoFile_id`,`src`);--> statement-breakpoint
CREATE INDEX `medias_index` ON `medias` (`episode_id`,`movie_id`,`person_id`,`season_id`,`tv_id`,`videoFile_id`);