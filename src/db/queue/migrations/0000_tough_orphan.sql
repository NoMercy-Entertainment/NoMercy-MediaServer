CREATE TABLE `failedJobs` (
	`id` text,
	`payload` text,
	`queue` text NOT NULL,
	`exception` text NOT NULL,
	`connection` datetime,
	`failedAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `queueJobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`queue` text NOT NULL,
	`task_id` text NOT NULL,
	`runAt` datetime,
	`payload` text,
	`result` text,
	`error` text,
	`progress` integer DEFAULT 0 NOT NULL,
	`key` text,
	`cron` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`maxAttempts` integer DEFAULT 0 NOT NULL,
	`notBefore` datetime,
	`finishedAt` datetime,
	`processedAt` datetime,
	`failedAt` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `failed_jobs_id_index` ON `failedJobs` (`id`);--> statement-breakpoint
CREATE INDEX `queue_jobs_id_index` ON `queueJobs` (`queue`,`priority`,`runAt`,`finishedAt`);--> statement-breakpoint
CREATE UNIQUE INDEX `queue_jobs_id_unique` ON `queueJobs` (`key`,`runAt`);