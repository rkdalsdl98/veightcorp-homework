import { tags } from "typia"

export interface ReplyCreateArgs {
    contents: string & tags.MaxLength<200>
    writer_email: string & tags.Format<"email">
    detail_id: string & tags.MaxLength<32>
    comment_id: (string & tags.MaxLength<32>) | null
}

export interface ReplyUpdateArgs {
    uuid: string & tags.MaxLength<32>
    writer_email: string & tags.Format<"email">
    contents: string
}

export interface ReplyDeleteArgs {
    uuid: string & tags.MaxLength<32>
    writer_email: string & tags.Format<"email">
    deletedAt: Date
}