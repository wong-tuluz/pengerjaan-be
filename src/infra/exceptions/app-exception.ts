export class DomainException extends Error {
    constructor(
        message: string,
        public readonly details?: unknown,
    ) {
        super(message);
    }
}

export class AppException extends Error {
    constructor(
        message = 'Something went wrong.',
        public readonly details?: unknown,
    ) {
        super(message);
    }
}