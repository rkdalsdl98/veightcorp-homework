import { tags } from "typia"
import { IReplyEntity } from "./reply.entity"

export interface IPostEntity {
    /** PK */
    uuid: string & tags.MaxLength<32>

    /** 
     * 게시글 분류 
     * @default "q-and-a"
     * */
    category: PostCategory

    /** 게시글 제목 */
    title: string & tags.MaxLength<100>

    /** 작성자 이메일 */
    writer_email: string & tags.Format<"email">

    /** 참조하는 게시글 상세 uuid */
    detail_id: string & tags.MaxLength<32>

    /** 게시글 작성 일 */
    createdAt: Date

    /** 게시글 삭제 일 */
    deletetAt: Date | null
} 

export interface IPostDetailEntity {
    /** PK */
    uuid: string & tags.MaxLength<32>

    /** 게시글 내용 */
    contents: string

    /** 조회수 */
    views: number

    /** 게시글에 달린 댓글 */
    replies: IReplyEntity[]

    /** 게시글 uuid */
    post_id: string & tags.MaxLength<32>

    /** 게시글 상세 업데이트 일 */
    updatedAt: Date

    /** 게시글 삭제 일 */
    deletetAt: Date | null
}

export type PostCategory = ("q-and-a" | "notice" | "man-to-man") & tags.MaxLength<10>