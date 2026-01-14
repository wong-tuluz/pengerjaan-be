import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { ApiResponseInterceptor } from './infra/responses/response.interceptor';
import { HttpExceptionFilter } from './exception-filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: '*'
        }
    });

    const config = new DocumentBuilder()
        .setTitle('Pengerjaan API')
        .setDescription('Pengerjaan api')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/openapi', app, document, {
        jsonDocumentUrl: '/openapi.json',
        swaggerOptions: {
            docExpansion: 'none',
        },
    });

    app.use(
        '/scalar',
        apiReference({
            content: cleanupOpenApiDoc(document),
        }),
    );

    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter)

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
