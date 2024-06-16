import { IPostDetailEntity } from "src/repository/entity/post.entity"
import { ReplyDto, toReplyDto } from "../dto/reply.dto"

export interface IPostCache {
    contents: string
    views: number
    load_factor: number
    replies: ReplyDto[]
    deletedAt: Date | null
    updatedAt: Date
}

export const toPostCache = (entity: IPostDetailEntity & { load_factor: number }): IPostCache => ({
    contents: entity.contents,
    views: entity.views,
    load_factor: entity.load_factor,
    replies: entity.replies.map(toReplyDto),
    deletedAt: entity.deletetAt,
    updatedAt: entity.updatedAt,
})