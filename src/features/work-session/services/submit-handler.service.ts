import { Injectable } from '@nestjs/common';
import { SubmitContract } from '../jobs/submit.contract';

@Injectable()
export class SubmitHandlerService {
    async handle(data: SubmitContract): Promise<void> {
    }
}
