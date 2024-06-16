import { Injectable } from "@nestjs/common";

import { ReplyRepository } from "../repository/reply.repository";
import RedisService from "./redis.service";
import { IPostCache } from "./interface/post.interface";

import * as dotenv from "dotenv"
dotenv.config()

@Injectable()
export class ReplyService {
    constructor(
        private readonly repository: ReplyRepository,
        private readonly redis: RedisService,
    ){}

    public async write(
        contents: string,
        writer_email: string,
        detail_id: string,
        comment_id: string | null,
    ) : Promise<boolean> {
        return await this.repository.create({
            contents,
            writer_email,
            detail_id,
            comment_id,
        })
    }

    public async edit(
        reply_id: string,
        writer_email: string,
        contents: string,
    ) : Promise<boolean> {
        const entity = await this.repository.update({
            uuid: reply_id,
            writer_email,
            contents,
        })

        this._updateReply({
            reply_id,
            detail_id: entity.detail_id,
            contents,
        })

        return true
    }

    public async delete(
        reply_id: string,
        writer_email: string,
    ) : Promise<boolean> {
        const deletedAt = new Date()
        const entity = await this.repository.delete({
            uuid: reply_id,
            writer_email,
            deletedAt,
        })

        this._updateReply({
            reply_id,
            detail_id: entity.detail_id,
            deletedAt,
        })
        
        return true
    }

    private async _updateReply({
        reply_id,
        detail_id,
        contents,
        deletedAt,
    }: { reply_id: string, detail_id: string, contents?: string, deletedAt?: Date }) : Promise<void> {
        const cache = await this.redis.get<IPostCache>(detail_id, ReplyService.name)
    
        if(cache) {
            for(let i=0; i<cache.replies.length; ++i) {
                if(cache.replies[i].uuid === reply_id) {
                    cache.replies[i].contents = contents ?? cache.replies[i].contents
                    cache.replies[i].deletedAt = deletedAt ?? cache.replies[i].deletedAt
                    break
                }
            }
            await this.redis.set(detail_id, cache, ReplyService.name, parseInt(process.env.POST_DETAIL_TTL ?? "1"))
        }
    }
}