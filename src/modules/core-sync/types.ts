export type TokenStore = {
    access_token: string,
    refresh_token: string
}

export type Agenda = {
    id: string;
    nama_event: string;
    mulai: Date;
    selesai: Date;
    createdAt: Date;
    jadwal: Jadwal[];
    peserta: Peserta[];
}

export type Jadwal = {
    id: string;
    nama_jadwal: string;
    mulai: Date;
    selesai: Date;
    token: string;
    batas_mulai_mengerjakan: Date;
    selesai_tepat_waktu: boolean;
    paket_soal: PaketSoal | null
}

export type PaketSoal = {
    id: string;
    nama_paket_soal: string;
    waktu: number; // in minutes
    tipe_pengerjaan: 'Perjenis' | 'Permateri';
    tampilkan_hasil_langsung: boolean | null
    tampilkan_hasil_langsung_text: string | null;
    createdAt: Date;
    materi: Materi[];
}

export type Materi = {
    id: string;
    nama_materi: string;
    urutan: number | null;
    waktu: number | null;
    tampilkan_hasil_langsung: boolean | null
    tampilkan_hasil_langsung_text: string | null;
    soal: Soal[];
}

export type Soal = {
    id: string;
    soal: string;
    tipe_jawaban: TipeSoal,
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

export type Peserta = {
    id_peserta_perevent: string,
    id_event: string,
    id_siswa: string,
    id_siswa_perkelas: string,
    nis: string,
    nama_siswa: string,
    tgl_lahir: string,
    username: string,
    password: string,
    nama_event: string,
    nama_kelas: string,
}

export type TipeSoal = 'tunggal' | 'multi';
