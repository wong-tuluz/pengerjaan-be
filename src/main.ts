import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { } from '@/core/zod/zod-openapi';
import { ZOD_BODY_SCHEMA } from './core/zod/zod-endpoint.constants';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Pengerjaan API')
        .setDescription('Pengerjaan api')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    app.use(
        '/scalar',
        apiReference({
            content: document,
        }),
    );

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
