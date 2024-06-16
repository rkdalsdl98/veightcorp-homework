import { TypedBody, TypedRoute } from "@nestia/core";
import { Controller, UseGuards } from "@nestjs/common";

import { ReplyService } from "../service/reply.service";
import { ReplyBody } from "./body/reply.body";
import { AuthGuard, GuardDecorator } from "../midleware/guard";
import { Payload } from "../utils/jwt";
import { ERROR } from "../utils";

@Controller('reply')
export class ReplyController {
    constructor(
        private readonly service: ReplyService,
    ){}

    @TypedRoute.Post()
    @UseGuards(AuthGuard)
    async write(
        @TypedBody() body: ReplyBody.Post.Create,
        @GuardDecorator.getAuthResult() payload: Payload,
    ) {
        try {
            if(payload.type === "refresh") throw ERROR.UnAuthorized
            const data = await this.service.write(
                body.contents,
                payload.data,
                body.detail_id,
                body.comment_id ?? null,
            )
            return {
                data,
                status: 201,
            }
        } catch(e) { return e } 
    }

    @TypedRoute.Patch()
    @UseGuards(AuthGuard)
    async edit(
        @TypedBody() body: ReplyBody.Patch.Update,
        @GuardDecorator.getAuthResult() payload: Payload,
    ) {
        try {
            if(payload.type === "refresh") throw ERROR.UnAuthorized
            const data = await this.service.edit(
                body.reply_id,
                payload.data,
                body.contents,
            )
            return {
                data,
                status: 200,
            }
        } catch(e) { return e }
    }

    @TypedRoute.Delete()
    @UseGuards(AuthGuard)
    async delete(
        @TypedBody() body: ReplyBody.Delete.Remove,
        @GuardDecorator.getAuthResult() payload: Payload,
    ) {
        try {
            if(payload.type === "refresh") throw ERROR.UnAuthorized
            const data = await this.service.delete(
                body.reply_id,
                payload.data,
            )
            return {
                data,
                status: 200,
            }
        } catch(e) { return e }
    }
}