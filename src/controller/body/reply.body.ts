import { tags } from "typia"

export namespace ReplyBody {
    export namespace Post {
        export interface Create {
            contents: string & tags.MaxLength<200>
            detail_id: string & tags.MaxLength<32>
            comment_id?: string & tags.MaxLength<32>
        }
    }
    export namespace Patch {
        export interface Update {
            reply_id: string & tags.MaxLength<32>
            contents: string & tags.MaxLength<200>
        }
    }
    export namespace Delete {
        export interface Remove {
            reply_id: string & tags.MaxLength<32>
        }
    }
}