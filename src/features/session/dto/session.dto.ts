import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreateSessionSchema = z.object({
    jadwalId: z.uuid(),
});

const SessionActionSchema = z.object({
    soalId: z.uuid(),
    marked: z.boolean().optional(),
    jawaban: z.array(
        z.object({
            jawabanSoalId: z.uuid().nullable(),
            value: z.string().nullable(),
        }),
    ),
});

export class CreateSessionDto extends createZodDto(CreateSessionSchema) {}

export class SessionActionDto extends createZodDto(SessionActionSchema) {}
