import { createZodDto } from "nestjs-zod";
import z from "zod";

const SubmitContractSchema = z.object({
    workSessionId: z.uuid(),
    soalId: z.uuid(),
    marked: z.boolean().optional(),
    jawaban: z.array(z.object({
        jawabanSoalId: z.uuid().nullable(),
        value: z.string().nullable()
    }))
});

// export class SubmitContract extends createZodDto(SubmitContractSchema) { }

export type SubmitContract = {
    workSessionId: string,
    soalId: string,
    marked?: boolean | null,
    jawaban: Array<{
        jawabanSoalId: string | null,
        value: string | null
    }>
}