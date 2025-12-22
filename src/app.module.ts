import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionService } from './question/question.service';
import { WorkSessionService } from './work-session/work-session.service';
import { AnswerRepository } from './work-session/repositories/answer-repository';
import { AnswerPersistenceWorker } from './work-session/consumers/work-session.consumer';
import { DrizzleModule } from './drizzle/drizzle.module';
import { QuestionsModule } from './questions/questions.module';
import { WorkSessionsModule } from './work-sessions/work-sessions.module';

@Module({
  imports: [DrizzleModule, QuestionsModule, WorkSessionsModule],
  controllers: [AppController],
  providers: [AppService, QuestionService, WorkSessionService, AnswerRepository, AnswerPersistenceWorker],

})
export class AppModule { }
