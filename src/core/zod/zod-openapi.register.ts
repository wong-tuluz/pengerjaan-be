import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  ZOD_BODY_SCHEMA,
  ZOD_RESPONSE_SCHEMA,
} from './zod-endpoint.constants';

export function autoRegisterZodOpenApi(app: INestApplication) {
  const registry = new OpenAPIRegistry();
  const reflector = app.get(Reflector);

  const server: any = app.getHttpServer();
  const router = server._events?.request?._router;

  if (!router?.stack) {
    throw new Error('Unsupported HTTP adapter (Express only)');
  }

  for (const layer of router.stack) {
    if (!layer.route) continue;

    const path = layer.route.path;

    for (const method of Object.keys(layer.route.methods)) {
      const handler = layer.route.stack[0]?.handle;
      if (!handler) continue;

      const bodySchema = reflector.get(ZOD_BODY_SCHEMA, handler);
      const responseSchema = reflector.get(ZOD_RESPONSE_SCHEMA, handler);

      if (!bodySchema && !responseSchema) continue;

      registry.registerPath({
        method: method as any,
        path,
        request: bodySchema
          ? {
              body: {
                content: {
                  'application/json': {
                    schema: bodySchema,
                  },
                },
              },
            }
          : undefined,
        responses: responseSchema
          ? {
              200: {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: responseSchema,
                  },
                },
              },
            }
          : {},
      });
    }
  }

  return registry;
}
