export class Siswa {
    id: string;
    accountId: string;
    nama: string;
    nis: string;
    kelas: string;
    username: string;
    password: string;

    constructor(data: {
        id: string;
        accountId: string;
        nama: string;
        nis: string;
        kelas: string;
        username: string;
        password: string;
    }) {
        this.id = data.id
        this.accountId = data.accountId
        this.nama = data.nama
        this.nis = data.nis
        this.kelas = data.kelas
        this.username = data.username
        this.password = data.password
    }

    public setPassword(passwd) {
        this.password = passwd
    }

    public setAccount(accountId) {
        this.accountId = accountId
    }
}