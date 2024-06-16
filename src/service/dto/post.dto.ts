import { IPostEntity, PostCategory } from "../../repository/entity/post.entity";
import { IPostDetailEntity } from "../../repository/entity/post.entity"
import { ReplyDto, toReplyDto } from "./reply.dto"

export interface PostDto {
    uuid: string
    title: string
    writer_email: string
    category: PostCategory
    detail_id: string
    createdAt: Date
}

export const toPostDto = (entity: IPostEntity): PostDto => ({
    uuid: entity.uuid,
    title: entity.title,
    writer_email: entity.writer_email,
    category: entity.category,
    detail_id: entity.detail_id,
    createdAt: new Date(entity.createdAt),
})


export interface PostDetailDto {
    uuid: string
    contents: string
    views: number
    replies: ReplyDto[]
    updatedAt: Date
}

export const toPostDetailDto = (entity: IPostDetailEntity): PostDetailDto => {
    const replies: ReplyDto[] = []
    
    for(let i=0; i<entity.replies.length; ++i) if(!entity.replies[i].deletedAt) replies.push(toReplyDto(entity.replies[i]))
    
    return {
        uuid: entity.uuid,
        contents: entity.contents,
        views: entity.views,
        replies,
        updatedAt: new Date(entity.updatedAt),
    }
}