// drizzle/schema.ts
import { mysqlTable, varchar, boolean, datetime, primaryKey } from "drizzle-orm/mysql-core";

export const sessions = mysqlTable("sessions", {
    id: varchar("id", { length: 36 }).primaryKey(),
    questionGroupId: varchar("question_group_id", { length: 36 }).notNull(),
    studentId: varchar("student_id", { length: 36 }),
    createdAt: datetime("created_at"),
    finishedAt: datetime("finished_at"),
});

export const sessionAnswers = mysqlTable("session_answers", {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }).notNull(),
    questionId: varchar("question_id", { length: 36 }).notNull(),
    answerId: varchar("answer_id", { length: 36 }),
    value: varchar("value", { length: 4096 }),
});

export const sessionMarkers = mysqlTable("session_markers", {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }),
    questionId: varchar("question_id", { length: 36 }),
    isMarked: boolean("is_marked"),
});
