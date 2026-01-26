import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
    constructor(
        message = 'Action cannot be done.',
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
