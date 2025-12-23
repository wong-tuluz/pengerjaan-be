import { SetMetadata } from '@nestjs/common';
import { ZodType } from 'zod';
import {
    ZOD_BODY_SCHEMA,
    ZOD_RESPONSE_SCHEMA,
} from './zod-endpoint.constants';

export function ZodBody(schema: ZodType) {
    return SetMetadata(ZOD_BODY_SCHEMA, schema);
}

export function ZodResponse(schema: ZodType) {
    return SetMetadata(ZOD_RESPONSE_SCHEMA, schema);
}