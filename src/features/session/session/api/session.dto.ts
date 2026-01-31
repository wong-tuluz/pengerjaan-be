import { createZodDto } from "nestjs-zod";
import z from "zod";

const CreateSessionSchema = z.object({
    jadwalId: z.uuid(),
    token: z.string()
});
export class CreateSessionDto extends createZodDto(CreateSessionSchema) { }
