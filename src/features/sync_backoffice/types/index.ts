export type Agenda = {
    id: string;
    nama_event: string;
    mulai: Date;
    selesai: Date;
    createdAt: Date;
    jadwal: Jadwal[];
}

export type Jadwal = {
    id: string;
    nama_jadwal: string;
    mulai: Date;
    selesai: Date;
    token: string;
    batas_mulai_mengerjakan: Date;
    selesai_tepat_waktu: boolean;
    paket_soal: PaketSoal
}

export type PaketSoal = {
    id: string;
    nama_paket_soal: string;
    waktu: number; // in minutes
    tipe_pengerjaan: 'Perjenis' | 'Paralel';
    tampilkan_hasil_langsung: boolean | null
    tampilkan_hasil_langsung_text: string | null;
    createdAt: Date;
    materi: Materi[];
}

export type Materi = {
    id: string;
    nama_materi: string;
    urutan: number;
    waktu: Date | null;
    tampilkan_hasil_langsung: boolean | null
    tampilkan_hasil_langsung_text: string | null;
}

export type Soal = {
    id: string;
    text: string;
    tipe_jawaban: 'tunggal' | 'ganda' | 'esai';
    bobot_benar: number,
    bobot_salah: number,
    kunci_jawaban: "C",
    wajib_tampil_nomor_ini: boolean | null,
    wajib_tampil_nomor_ini_text: string | null,
    nomor_soal: number,
    pilihan_jawaban: Jawaban[];
}

export type Jawaban = {
    id: string;
    nama_opsi: string;
    isi_opsi: string;
    kunci_opsi: string;
    bobot_opsi: number | null;
}