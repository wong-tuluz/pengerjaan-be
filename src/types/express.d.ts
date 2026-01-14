import 'express';

declare global {
    namespace Express {
        interface User {
            userId: string;
            proktor: boolean;
        }

        interface Request {
            user?: User;
        }
    }
}
