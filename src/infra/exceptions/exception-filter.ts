import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException, AppException } from './app-exception';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        // Default values
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorType: 'USER_INPUT' | 'APPLICATION' = 'APPLICATION';
        let message = 'Internal server error';
        let details: unknown;

        if (exception instanceof DomainException) {
            status = HttpStatus.BAD_REQUEST;
            errorType = 'USER_INPUT';
            message = exception.message;
            details = exception.details;
        } else if (exception instanceof AppException) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            details = exception.details;
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();

            message =
                typeof response === 'string'
                    ? response
                    : (response as any).message ?? message;

            if (status >= 400 && status < 500) {
                errorType = 'USER_INPUT';
            }
        }

        res.status(status).json({
            code: status,
            error: {
                type: errorType,
                message,
                details,
            },
        });
    }
}
