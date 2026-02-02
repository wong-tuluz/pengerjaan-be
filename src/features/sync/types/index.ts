export type Event = {
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
}

export type PaketSoal = {
    id: string;
    nama_paket_soal: string;
    waktu: number; // in minutes
    tipe_penge
}