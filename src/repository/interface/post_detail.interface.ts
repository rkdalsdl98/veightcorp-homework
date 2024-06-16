import { tags } from "typia"

export interface PostDetailFindArgs {
    detail_id: string & tags.MaxLength<32>
}

export interface PostDetailCreateArgs {
    contents: string
}