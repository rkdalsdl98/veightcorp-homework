import { IReplyEntity } from "../../repository/entity/reply.entity"

export interface ReplyDto {
    uuid: string
    contents: string
    writer_email: string
    comment_id: string | null
    createdAt: Date
    deletedAt: Date | null
}

export const toReplyDto = (entity: IReplyEntity) : ReplyDto => ({
    uuid: entity.uuid,
    contents: entity.contents,
    writer_email: entity.writer_email,
    comment_id: entity.comment_id,
    createdAt: new Date(entity.createdAt),
    deletedAt: entity.deletedAt,
})
