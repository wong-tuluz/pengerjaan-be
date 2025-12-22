import { pgTable, uuid, varchar, integer, text, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUMS
export const questionTypeEnum = pgEnum("question_type", [
    "multiple-choice",
    "complex-multiple-choice",
]);

// QUESTION GROUP TABLE
export const questionGroups = pgTable("question_groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    timeLimitSeconds: integer("time_limit_seconds").notNull().default(0),
});

// QUESTIONS TABLE
export const questions = pgTable("questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
        .notNull()
        .references(() => questionGroups.id, { onDelete: "cascade" }),
    type: questionTypeEnum("type").notNull(),
    number: integer("number").notNull(),
    question: varchar().notNull()
});

// ANSWERS TABLE
export const questionAnswers = pgTable("question_answers", {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
        .notNull()
        .references(() => questions.id, { onDelete: "cascade" }),
    answer: text("text").notNull(),

    isCorrect: boolean("is_correct").notNull().default(false),
});

export const questionGroupRelations = relations(questionGroups, ({ many }) => ({
    questions: many(questions),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
    group: one(questionGroups, {
        fields: [questions.groupId],
        references: [questionGroups.id],
    }),
    answers: many(questionAnswers),
}));

export const questionAnswerRelations = relations(questionAnswers, ({ one }) => ({
    question: one(questions, {
        fields: [questionAnswers.questionId],
        references: [questions.id],
    }),
}));
