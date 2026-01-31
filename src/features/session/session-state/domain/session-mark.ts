import { v7 } from "uuid"

export class SessionMark {
    id: string
    workSessionId: string
    soalId: string
    isMarked: boolean

    constructor(data: {
        id: string,
        workSessionId: string,
        soalId: string,
        isMarked: boolean,
    }) {
        this.id = data.id
        this.workSessionId = data.workSessionId
        this.soalId = data.soalId
        this.isMarked =data.isMarked
     }

    static create(workSessionId: string, soalId: string, isMarked: boolean): SessionMark {
        return new SessionMark({
            id: v7(),
            workSessionId,
            soalId,
            isMarked
        })
    }
}