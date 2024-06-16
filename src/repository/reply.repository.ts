import { Injectable } from "@nestjs/common";

import { ReplyCreateArgs, ReplyDeleteArgs, ReplyUpdateArgs } from "./interface/reply.interface";
import { ReplyProvider } from "./provider/reply.provider";
import { IReplyEntity } from "./entity/reply.entity";

@Injectable()
export class ReplyRepository {
    async create(args: ReplyCreateArgs): Promise<boolean> {
        return await ReplyProvider
        .entity
        .create({
            data: {
                contents: args.contents,
                writer_email: args.writer_email,
                comment_id: args.comment_id,
                detail: {
                    connect: {
                        uuid: args.detail_id
                    }
                }
            }
        })
    }

    async update(args: ReplyUpdateArgs): Promise<IReplyEntity> {
        return await ReplyProvider
        .entity
        .update({
            data: { contents: args.contents },
            where: { 
                uuid: args.uuid,
                writer_email: args.writer_email, 
            }
        })
    }

    async delete(args: ReplyDeleteArgs): Promise<IReplyEntity> {
        return await ReplyProvider
        .entity
        .update({
            data: { deletedAt: args.deletedAt },
            where: { 
                uuid: args.uuid,
                writer_email: args.writer_email, 
            }
        })
    }
}