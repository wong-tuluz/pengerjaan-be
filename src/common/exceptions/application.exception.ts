import { HttpException, HttpStatus } from '@nestjs/common';



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
