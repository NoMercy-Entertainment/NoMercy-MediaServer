DROP INDEX IF EXISTS `medias_index`;--> statement-breakpoint
CREATE INDEX `medias_index` ON `medias` (`episode_id`,`movie_id`,`person_id`,`season_id`,`tv_id`,`videoFile_id`);