import { Module } from "@nestjs/common";

import { ReplyController } from "../controller/reply.controller";
import { ReplyService } from "../service/reply.service";
import { ReplyRepository } from "../repository/reply.repository";
import RedisModule from "./redis.module";

@Module({
    imports: [RedisModule],
    providers: [
        ReplyService,
        ReplyRepository,
    ],
    controllers: [ReplyController],
})
export default class ReplyModule {}