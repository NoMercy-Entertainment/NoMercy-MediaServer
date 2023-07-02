DROP INDEX IF EXISTS `userData_special_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `userData_special_unique` ON `userData` (`special_id`,`tv_id`,`videoFile_id`,`user_id`);