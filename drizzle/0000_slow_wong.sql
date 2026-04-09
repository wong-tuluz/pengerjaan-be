CREATE TABLE `work_session_answers` (
	`id` varchar(255) NOT NULL,
	`work_session_id` varchar(255) NOT NULL,
	`soal_id` varchar(255) NOT NULL,
	`jawaban_soal_id` varchar(255),
	`value` varchar(4096),
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `work_session_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_session_markers` (
	`id` varchar(255) NOT NULL,
	`work_session_id` varchar(255) NOT NULL,
	`soal_id` varchar(255) NOT NULL,
	`is_marked` boolean NOT NULL DEFAULT false,
	CONSTRAINT `work_session_markers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_sessions` (
	`id` varchar(255) NOT NULL,
	`siswa_id` varchar(255) NOT NULL,
	`jadwal_id` varchar(255) NOT NULL,
	`paket_soal_id` varchar(255) NOT NULL,
	`materi_soal_id` varchar(255),
	`status` enum('in_progress','finished') NOT NULL,
	`strike` int NOT NULL DEFAULT 0,
	`time_limit` int NOT NULL,
	`started_at` datetime NOT NULL,
	`finished_at` datetime,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `work_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siswa` (
	`id` varchar(255) NOT NULL,
	`account_id` varchar(255),
	`nama` varchar(255) NOT NULL,
	`nis` varchar(50) NOT NULL,
	`kelas` varchar(50) NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `siswa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jawaban_soal` (
	`id` varchar(255) NOT NULL,
	`soal_id` varchar(255) NOT NULL,
	`value` longtext NOT NULL,
	`is_correct` boolean NOT NULL,
	`order` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `jawaban_soal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materi_soal` (
	`id` varchar(255) NOT NULL,
	`remote_id` varchar(255),
	`paket_soal_id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`order` int NOT NULL,
	`time_limit` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `materi_soal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paket_soal` (
	`id` varchar(255) NOT NULL,
	`remote_id` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `paket_soal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soal` (
	`id` varchar(255) NOT NULL,
	`remote_id` varchar(255),
	`materi_soal_id` varchar(255) NOT NULL,
	`type` enum('single-choice','multiple-choice','essay') NOT NULL,
	`prompt` longtext NOT NULL,
	`order` int NOT NULL,
	`weight_correct` int NOT NULL,
	`weight_wrong` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `soal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agenda_siswa` (
	`id` varchar(255) NOT NULL,
	`remote_id` varchar(255),
	`agenda_id` varchar(255) NOT NULL,
	`siswa_id` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `agenda_siswa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agenda` (
	`id` varchar(255) NOT NULL,
	`remote_id` varchar(255),
	`title` varchar(255) NOT NULL,
	`start_time` datetime NOT NULL,
	`end_time` datetime NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `agenda_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jadwal` (
	`id` varchar(255) NOT NULL,
	`remote_id` varchar(255),
	`agenda_id` varchar(255) NOT NULL,
	`paket_soal_id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`start_time` datetime NOT NULL,
	`end_time` datetime NOT NULL,
	`time_limit` int NOT NULL,
	`attempts` int NOT NULL,
	`token` varchar(36) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now(),
	`updated_at` datetime,
	CONSTRAINT `jadwal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jwks` (
	`id` varchar(36) NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text NOT NULL,
	`created_at` timestamp(3) NOT NULL,
	`expires_at` timestamp(3),
	CONSTRAINT `jwks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	`username` varchar(255),
	`display_username` text,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(255) NOT NULL,
	`data` json,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `work_session_idx` ON `work_session_answers` (`work_session_id`);--> statement-breakpoint
CREATE INDEX `soal_idx` ON `work_session_answers` (`soal_id`);--> statement-breakpoint
CREATE INDEX `work_session_idx` ON `work_session_markers` (`work_session_id`);--> statement-breakpoint
CREATE INDEX `soal_idx` ON `work_session_markers` (`soal_id`);--> statement-breakpoint
CREATE INDEX `siswa_idx` ON `work_sessions` (`siswa_id`);--> statement-breakpoint
CREATE INDEX `jadwal_idx` ON `work_sessions` (`jadwal_id`);--> statement-breakpoint
CREATE INDEX `soal_idx` ON `jawaban_soal` (`soal_id`);--> statement-breakpoint
CREATE INDEX `paket_soal_idx` ON `materi_soal` (`paket_soal_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `materi_soal` (`remote_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `paket_soal` (`remote_id`);--> statement-breakpoint
CREATE INDEX `materi_soal_idx` ON `soal` (`materi_soal_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `soal` (`remote_id`);--> statement-breakpoint
CREATE INDEX `agenda_idx` ON `agenda_siswa` (`agenda_id`);--> statement-breakpoint
CREATE INDEX `siswa_idx` ON `agenda_siswa` (`siswa_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `agenda_siswa` (`remote_id`);--> statement-breakpoint
CREATE INDEX `agenda_idx` ON `jadwal` (`agenda_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `jadwal` (`remote_id`);--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);