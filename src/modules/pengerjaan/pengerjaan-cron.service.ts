import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db, workSessionTable, jadwalTable } from 'src/common/db';
import { eq, and, sql, lt, or, inArray } from 'drizzle-orm';

@Injectable()
export class PengerjaanCronService {
  private readonly logger = new Logger(PengerjaanCronService.name);

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running auto-finish work sessions cron job');

    try {
      const now = new Date();

      const expiredSessions = await db.select({ id: workSessionTable.id })
        .from(workSessionTable)
        .innerJoin(jadwalTable, eq(workSessionTable.jadwalId, jadwalTable.id))
        .where(
          and(
            eq(workSessionTable.status, 'in_progress'),
            or(
              sql`DATE_ADD(${workSessionTable.startedAt}, INTERVAL ${workSessionTable.timeLimit} MINUTE) < ${now}`,
              lt(jadwalTable.endTime, now)
            )
          )
        );

      if (expiredSessions.length > 0) {
        const ids = expiredSessions.map(s => s.id);
        this.logger.log(`Finishing ${ids.length} expired sessions: ${ids.join(', ')}`);

        await db.update(workSessionTable)
          .set({
            status: 'finished',
            finishedAt: now,
            updatedAt: now
          })
          .where(inArray(workSessionTable.id, ids));
      }
    } catch (error) {
      this.logger.error('Error in auto-finish cron job', error);
    }
  }
}
