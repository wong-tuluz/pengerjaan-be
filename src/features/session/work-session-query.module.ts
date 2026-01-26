import { Module } from "@nestjs/common";
import { SessionQueryService } from "./services/session-query.service";
import { DrizzleModule } from "../../infra/drizzle/drizzle.module";

@Module({
    imports: [DrizzleModule],
    exports: [SessionQueryService],
    providers: [SessionQueryService]
})
export class WorkSessionQueryModule { }