CREATE TABLE `accounts` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `acc_provider_idx` ON `accounts` (`provider`,`provider_account_id`);--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`created_at` integer DEFAULT (unixepoch()*1000),
	`updated_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_insights` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`content_it` text NOT NULL,
	`content_en` text NOT NULL,
	`metadata` text,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `body_measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`measured_at` integer NOT NULL,
	`weight_kg` real,
	`body_fat_pct` real,
	`chest_cm` real,
	`waist_cm` real,
	`hips_cm` real,
	`shoulders_cm` real,
	`left_arm_cm` real,
	`right_arm_cm` real,
	`left_thigh_cm` real,
	`right_thigh_cm` real,
	`left_calf_cm` real,
	`right_calf_cm` real,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_it` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_it` text NOT NULL,
	`description_en` text,
	`description_it` text,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text,
	`equipment_id` text,
	`difficulty` text NOT NULL,
	`movement_type` text NOT NULL,
	`instructions_en` text,
	`instructions_it` text,
	`mistakes_en` text,
	`mistakes_it` text,
	`tips_en` text,
	`tips_it` text,
	`breathing_en` text,
	`breathing_it` text,
	`alternatives` text,
	`video_url` text,
	`image_url` text,
	`tags` text,
	`is_custom` integer DEFAULT false,
	`created_by_user_id` text,
	`created_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_slug_unique` ON `exercises` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `ex_slug_idx` ON `exercises` (`slug`);--> statement-breakpoint
CREATE TABLE `muscles` (
	`id` text PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_it` text NOT NULL,
	`group` text NOT NULL,
	`body_part` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `personal_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`type` text NOT NULL,
	`value` real NOT NULL,
	`weight_kg` real,
	`reps` integer,
	`workout_id` text,
	`achieved_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pr_user_ex_idx` ON `personal_records` (`user_id`,`exercise_id`,`type`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`age` integer,
	`gender` text,
	`height_cm` real,
	`weight_kg` real,
	`goal` text,
	`level` text,
	`weekly_frequency` integer,
	`session_duration_min` integer,
	`equipment` text,
	`preferred_exercises` text,
	`excluded_exercises` text,
	`priority_muscles` text,
	`physical_limitations` text,
	`language` text DEFAULT 'it',
	`units` text DEFAULT 'metric',
	`theme` text DEFAULT 'dark',
	`default_rest_sec` integer DEFAULT 90,
	`auto_start_timer` integer DEFAULT true,
	`onboarding_done` integer DEFAULT false,
	`updated_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `program_days` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`name` text NOT NULL,
	`day_order` integer NOT NULL,
	`target_muscles` text,
	`duration_min` integer,
	`notes` text,
	FOREIGN KEY (`program_id`) REFERENCES `workout_programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `progress_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`photo_type` text NOT NULL,
	`url` text NOT NULL,
	`taken_at` integer NOT NULL,
	`notes` text,
	`weight_kg` real,
	`created_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sets` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_ex_id` text NOT NULL,
	`set_order` integer NOT NULL,
	`set_type` text DEFAULT 'normal' NOT NULL,
	`weight_kg` real,
	`reps` integer,
	`rpe` real,
	`rir` integer,
	`duration_sec` integer,
	`is_completed` integer DEFAULT false,
	`is_pr` integer DEFAULT false,
	`notes` text,
	`completed_at` integer,
	FOREIGN KEY (`workout_ex_id`) REFERENCES `workout_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `template_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`program_day_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`exercise_order` integer NOT NULL,
	`superset_group_id` text,
	`superset_order` integer,
	`sets_target` integer DEFAULT 3,
	`reps_min` integer,
	`reps_max` integer,
	`weight_kg` real,
	`rpe` real,
	`rir` integer,
	`rest_sec` integer,
	`notes` text,
	FOREIGN KEY (`program_day_id`) REFERENCES `program_days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer,
	`image` text,
	`created_at` integer DEFAULT (unixepoch()*1000)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vt_idx` ON `verification_tokens` (`identifier`,`token`);--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`exercise_order` integer NOT NULL,
	`superset_group_id` text,
	`superset_order` integer,
	`rest_sec` integer,
	`notes` text,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_programs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`goal` text,
	`level` text,
	`days_per_week` integer,
	`duration_min` integer,
	`is_active` integer DEFAULT false,
	`is_archived` integer DEFAULT false,
	`is_ai_generated` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()*1000),
	`updated_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`program_id` text,
	`program_day_id` text,
	`name` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`duration_sec` integer,
	`total_volume_kg` real,
	`total_sets` integer,
	`notes` text,
	`is_completed` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()*1000),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`program_id`) REFERENCES `workout_programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program_day_id`) REFERENCES `program_days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workout_user_idx` ON `workouts` (`user_id`);