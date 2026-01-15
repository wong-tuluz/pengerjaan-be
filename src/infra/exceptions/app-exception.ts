import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
    constructor(
        message: string,
        details?: unknown,
        status: HttpStatus = HttpStatus.BAD_REQUEST,
    ) {
        super(
            {
                message,
                errors: details,
            },
            status,
        );
    }
}

export class AppException extends HttpException {
    constructor(
        message = 'Something went wrong.',
        details?: unknown,
        status: HttpStatus = HttpStatus.BAD_REQUEST,
    ) {
        super(
            {
                message,
                errors: details,
            },
            status,
        );
    }
}
