import { ObjectUnsubscribedError } from 'rxjs'
import { v7 } from 'uuid'
import { object } from 'zod'

export type QuestionType = 'multiple-choice' | 'complex-choice' | 'essay'

export class QuestionGroup {
    id: string
    name: string
    description: string

    static create(name: string, description: string): QuestionGroup {
        const obj = new QuestionGroup()

        obj.id = v7()
        obj.name = name
        obj.description = description

        return obj
    }

    map(data: Partial<QuestionGroup>): QuestionGroup {
        const obj = new QuestionGroup()

        this.id = data.id ?? this.id
        this.name = data.name ?? this.name
        this.description = data.description ?? this.description

        return obj
    }
}

export class Question {
    id: string
    groupId: string

    prompt: string
    type: QuestionType
    answers: QuestionAnswer[] = []

    static create(type: QuestionType, groupId: string, prompt: string): Question {
        const obj = new Question()

        obj.id = v7()
        obj.groupId = groupId
        obj.type = type
        obj.prompt = prompt

        return obj
    }

    map(data: Partial<Question>): QuestionGroup {
        const obj = new QuestionGroup()

        this.id = data.id ?? this.id
        this.groupId = data.groupId ?? this.groupId
        this.prompt = data.prompt ?? this.prompt
        this.type = data.type ?? this.type

        return obj
    }

    clearAnswers() {
        this.answers = [];
    }

    addAnswer(value: string, isCorrect: boolean) {
        this.answers.push(new QuestionAnswer(v7(), this.id, value, isCorrect))
    }

    /*
    * Asserting valid domain before save / returns
    */
    public assert() {
        if (this.answers.length < 1)
            throw new Error("No answers decided for this question")

        switch (this.type) {
            case 'complex-choice': {
                break;
            }

            case 'multiple-choice': {
                if (this.answers.filter((x) => x.isCorrect).length != 1)
                    throw new Error("Multiple choice question should contain one correct answer")
                break;
            }

            case 'essay': {
                if (this.answers.length != 1)
                    throw new Error("Essay question should contain one answer")
                break;
            }
        }
    }
}

export class QuestionAnswer {
    readonly id: string
    questionId: string

    isCorrect: boolean
    value: string

    constructor(id: string, questionId: string, value: string, isCorrect: boolean) {
        this.id = id
        this.questionId = questionId
        this.value = value
        this.isCorrect = isCorrect
    }
}