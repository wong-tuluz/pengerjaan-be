import {
    mysqlTable,
    varchar,
    int,
    text,
    boolean,
    mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from 'drizzle-orm';

// ENUMS
export const questionTypeEnum = mysqlEnum("question_type", [
    "multiple-choice",
    "complex-choice",
    "essay",
]);

// QUESTION GROUP TABLE
export const questionGroups = mysqlTable("question_groups", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),

    randomizeAnswer: boolean("randomize_answer")
        .notNull()
        .default(true),

    randomizeQuestion: boolean("randomize_question")
        .notNull()
        .default(true),
});

// QUESTIONS TABLE
export const questions = mysqlTable("questions", {
    id: varchar("id", { length: 36 }).primaryKey(),

    groupId: varchar("group_id", { length: 36 })
        .notNull()
        .references(() => questionGroups.id, {
            onDelete: "cascade",
        }),

    type: mysqlEnum("type", [
        "multiple-choice",
        "complex-choice",
        "essay",
    ]).notNull(),

    prompt: text("prompt").notNull(),
});

// ANSWERS TABLE
export const questionAnswers = mysqlTable("question_answers", {
    id: varchar("id", { length: 36 }).primaryKey(),

    questionId: varchar("question_id", { length: 36 })
        .notNull()
        .references(() => questions.id, {
            onDelete: "cascade",
        }),

    value: text("text").notNull(),

    isCorrect: boolean("is_correct")
        .notNull()
        .default(false),
})

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

export const questionAnswerRelations = relations(
    questionAnswers,
    ({ one }) => ({
        question: one(questions, {
            fields: [questionAnswers.questionId],
            references: [questions.id],
        }),
    }),
);
