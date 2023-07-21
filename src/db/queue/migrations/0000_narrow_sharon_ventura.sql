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
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`finishedAt` datetime,
	`failedAt` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `failed_jobs_id_index` ON `failedJobs` (`id`);--> statement-breakpoint
CREATE INDEX `queue_jobs_id_index` ON `queueJobs` (`queue`,`priority`,`runAt`,`finishedAt`);