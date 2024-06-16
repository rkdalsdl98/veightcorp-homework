import { tags } from "typia"

import { PostCategory } from "../../repository/entity/post.entity"

export namespace PostBody {
    export namespace Post {
        export interface Create {
            title: string & tags.MaxLength<100>
            category: PostCategory
            contents: string
        }
    }
    export namespace Patch {
        export interface Update {
            post_id: string & tags.MaxLength<32>
            category: PostCategory
            title? : string & tags.MaxLength<100>
            contents?: string
        }
    }
    export namespace Delete {
        export interface Remove {
            post_id: string & tags.MaxLength<32>
            category: PostCategory
        }
    }
}