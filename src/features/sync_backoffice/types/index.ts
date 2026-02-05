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
    soal: Soal[];
}

export type Soal = {
    id: string;
    soal: string;
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

//             "id_peserta_perevent": "58712444-2c6b-44ed-a6dd-c46d82536e44",
//         "id_event": "74a97ff6-2ded-488b-b6d4-60d4028aa9b8",
//         "id_siswa": "a489754c-f74f-49b1-b935-594da103918e",
//         "id_siswa_perkelas": "35947fc8-3414-486a-8e12-f084a1e8eaf5",
//         "created_at": "2026-01-26T04:38:42.000000Z",
//         "updated_at": "2026-01-26T04:38:42.000000Z",
//         "nis": "101",
//         "nama_siswa": "Riyan",
//         "tgl_lahir": "2026-01-14",
//         "username": "101",
//         "password": "17a540a9be7d82ba31a439e855d6db70",
//         "nama_event": "Kenaikan Kelas",
//         "id_kelas": "3997defa-ed0f-4c13-b400-66e5420953a4",
//         "nama_kelas": "Kelas 1"
// }