import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { } from '@/core/zod-openapi';
import { ZOD_BODY_SCHEMA } from './core/zod-endpoint.constants';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Pengerjaan API')
        .setDescription('Pengerjaan api')
        .setVersion('1.0')
        .build();

    // const document = SwaggerModule.createDocument(app, config);
    const document = generateZodOpenApi(app);

    app.use(
        '/reference',
        apiReference({
            content: document,
        }),
    );

    await app.listen(process.env.PORT ?? 3000);
}

function generateZodOpenApi(app: INestApplication) {
    const swagger = SwaggerModule.createDocument(app, {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0' },
    });

    const registry = new OpenAPIRegistry();

    for (const path of Object.values(swagger.paths)) {
        for (const method of Object.values(path)) {
            const handler = (method as any)['x-handler'];
            if (!handler) continue;

            const bodySchema = Reflect.getMetadata(
                ZOD_BODY_SCHEMA,
                handler,
            );

            if (bodySchema) {
                registry.registerPath({
                    method: method.method,
                    path: method.path,
                    request: {
                        body: {
                            content: {
                                'application/json': { schema: bodySchema },
                            },
                        },
                    },
                    responses: {},
                });
            }
        }
    }

    return registry;
}


bootstrap();
