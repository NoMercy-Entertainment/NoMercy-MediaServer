DROP INDEX IF EXISTS `medias_index`;--> statement-breakpoint
CREATE INDEX `medias_index` ON `medias` (`id`,`tv_id`,`season_id`,`episode_id`,`movie_id`,`person_id`,`videoFile_id`);