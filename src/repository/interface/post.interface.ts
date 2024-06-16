import { tags } from "typia"
import { PostCategory } from "../entity/post.entity"
import { PostDetailCreateArgs } from "./post_detail.interface"

export interface PostFindManyArgs {
    title?: string & tags.MaxLength<100>
    writer_email?: string & tags.Format<"email">
    startwith?: Date
    orderBy?: { createdAt?: "asc" | "desc", views?: "asc" | "desc" }
}

export interface PostCreateArgs {
    title: string & tags.MaxLength<100>
    category: PostCategory
    writer_email: string & tags.Format<"email">
    detail: PostDetailCreateArgs
}

export interface PostUpdateArgs {
    uuid: string & tags.MaxLength<32>
    writer_email: string & tags.Format<"email">
    category: PostCategory
    views?: number
    title? : string & tags.MaxLength<100>
    contents?: string
}

export interface PostDeleteArgs {
    uuid: string & tags.MaxLength<32>
    category: PostCategory
    writer_email: string & tags.Format<"email">
    deletedAt: Date
}