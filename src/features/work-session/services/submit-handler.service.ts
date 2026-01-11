import { Injectable } from '@nestjs/common';
import { SubmitContract } from '../jobs/submit.contract';

@Injectable()
export class SubmitHandlerService {
    async handle(data: SubmitContract): Promise<void> {
        // store to database
        // invalidate session cache redis

        console.log('Handling submit:', data);
    }
}
