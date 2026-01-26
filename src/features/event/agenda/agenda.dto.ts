import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const ApiDateTime = z.iso.datetime().transform((v) => new Date(v));

const JadwalInputSchema = z.object({
    paketSoalId: z.uuid(),
    startTime: ApiDateTime,
    endTime: ApiDateTime,
    timeLimit: z.int(),
    attempts: z.int()
});

const UpdateAgendaSchema = z.object({
    title: z.string().min(1).optional(),
    startTime: ApiDateTime,
    endTime: ApiDateTime,
    description: z.string().nullable().optional(),
    jadwal: z.array(JadwalInputSchema).nullable().optional(),
});

const CreateAgendaSchema = z.object({
    title: z.string().min(1),
    startTime: ApiDateTime,
    endTime: ApiDateTime,
    description: z.string().nullable().optional(),
    jadwal: z.array(JadwalInputSchema).optional(),
});

export class CreateAgendaDto extends createZodDto(CreateAgendaSchema) { }

export class UpdateAgendaDto extends createZodDto(UpdateAgendaSchema) { }
