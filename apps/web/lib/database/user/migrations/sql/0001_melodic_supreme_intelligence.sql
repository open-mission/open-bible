CREATE TABLE `installed_bibles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`installed_at` integer NOT NULL,
	`version_code` integer DEFAULT 1 NOT NULL
);
