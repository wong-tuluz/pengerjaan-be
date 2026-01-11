import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

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
            content: cleanupOpenApiDoc(document),
        }),
    );

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
