import { createZodDto } from "nestjs-zod";
import z from "zod";

const SubmitContractSchema = z.object({
    id: z.uuid(),
    workSessionId: z.uuid(),
    soalId: z.uuid(),
    marked: z.boolean().optional(),
    jawaban: z.array(z.object({
        jawabanSoalId: z.uuid().nullable(),
        value: z.string().nullable()
    }))
});

export class SubmitContract extends createZodDto(SubmitContractSchema) { }