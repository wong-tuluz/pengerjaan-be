import { createZodDto } from "nestjs-zod";
import z from "zod";

const siswaSetPasswordSchema = z.object({
    password: z.string()
})

export class SiswaSetPasswordDto extends createZodDto(siswaSetPasswordSchema) { }