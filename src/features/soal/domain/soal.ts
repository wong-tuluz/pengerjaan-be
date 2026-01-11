export type SoalType = 'multiple-choice' | 'essay' | 'complex-choice';

export class Soal {
    public id: string;
    public materiSoalId: string;
    public type: SoalType;
    public prompt: string;
    public order: number;
    public weightCorrect: number;
    public weightWrong: number;
}

export class JawabanSoal {
    public id: string;
    public soalId: string;
    public value: string;
    public isCorrect: boolean;
    public order: number;
}
