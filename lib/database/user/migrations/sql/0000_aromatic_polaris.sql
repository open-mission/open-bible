CREATE TABLE `note_references` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`bible` text NOT NULL,
	`book` text NOT NULL,
	`chapter` integer NOT NULL,
	`verse_start` integer NOT NULL,
	`verse_end` integer,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_note_references_note_id` ON `note_references` (`note_id`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`content` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
