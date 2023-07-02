DROP INDEX IF EXISTS `queue_jobs_id_unique`;--> statement-breakpoint
ALTER TABLE `queueJobs` DROP COLUMN `key`;--> statement-breakpoint
ALTER TABLE `queueJobs` DROP COLUMN `cron`;--> statement-breakpoint
ALTER TABLE `queueJobs` DROP COLUMN `maxAttempts`;--> statement-breakpoint
ALTER TABLE `queueJobs` DROP COLUMN `notBefore`;--> statement-breakpoint
ALTER TABLE `queueJobs` DROP COLUMN `processedAt`;