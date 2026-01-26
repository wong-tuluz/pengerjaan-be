import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const res = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((data) => {
                const statusCode = res.statusCode;
                if (statusCode === 204) {
                    return {
                        success: true,
                        code: 204,
                    };
                }

                const response: any = {
                    success: true,
                    code: statusCode,
                    data,
                };



                return response;
            }),
        );
    }
}