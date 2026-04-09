ALTER TABLE `materi_soal` ADD `remote_id` varchar(255);--> statement-breakpoint
ALTER TABLE `paket_soal` ADD `remote_id` varchar(255);--> statement-breakpoint
ALTER TABLE `soal` ADD `remote_id` varchar(255);--> statement-breakpoint
ALTER TABLE `agenda_siswa` ADD `remote_id` varchar(255);--> statement-breakpoint
ALTER TABLE `agenda` ADD `remote_id` varchar(255);--> statement-breakpoint
ALTER TABLE `jadwal` ADD `remote_id` varchar(255);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `materi_soal` (`remote_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `paket_soal` (`remote_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `soal` (`remote_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `agenda_siswa` (`remote_id`);--> statement-breakpoint
CREATE INDEX `remote_idx` ON `jadwal` (`remote_id`);