ALTER TABLE `work_session_answers` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_session_answers` MODIFY COLUMN `work_session_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_session_answers` MODIFY COLUMN `soal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_session_answers` MODIFY COLUMN `jawaban_soal_id` varchar(255);--> statement-breakpoint
ALTER TABLE `work_session_markers` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_session_markers` MODIFY COLUMN `work_session_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_session_markers` MODIFY COLUMN `soal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_sessions` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_sessions` MODIFY COLUMN `siswa_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_sessions` MODIFY COLUMN `jadwal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_sessions` MODIFY COLUMN `paket_soal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `work_sessions` MODIFY COLUMN `materi_soal_id` varchar(255);--> statement-breakpoint
ALTER TABLE `siswa` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `siswa` MODIFY COLUMN `account_id` varchar(255);--> statement-breakpoint
ALTER TABLE `jawaban_soal` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `jawaban_soal` MODIFY COLUMN `soal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `materi_soal` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `materi_soal` MODIFY COLUMN `paket_soal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `paket_soal` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `soal` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `soal` MODIFY COLUMN `materi_soal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `agenda_siswa` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `agenda_siswa` MODIFY COLUMN `agenda_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `agenda_siswa` MODIFY COLUMN `siswa_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `agenda` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `jadwal` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `jadwal` MODIFY COLUMN `agenda_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `jadwal` MODIFY COLUMN `paket_soal_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `jadwal` MODIFY COLUMN `token` varchar(255) NOT NULL;