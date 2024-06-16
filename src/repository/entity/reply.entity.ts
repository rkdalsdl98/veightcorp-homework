import { tags } from "typia"

export interface IReplyEntity {
    /** PK */
    uuid: string & tags.MaxLength<32>

    /** 댓글 내용 */
    contents: string & tags.MaxLength<200>

    /** 댓글 작성자 이메일 */
    writer_email: string & tags.Format<"email">

    detail_id: string & tags.MaxLength<32>

    /**
     * 어떠한 댓글에 대댓글 인지 분류를 위한 댓글의 id
     * 
     * 해당 요소가 존재할 경우 대댓글임을 나타냄
     */
    comment_id: (string & tags.MaxLength<32>) | null

    /** 댓글 작성 일 */
    createdAt: Date

    /** 댓글 삭제 일 */
    deletedAt: Date | null
}