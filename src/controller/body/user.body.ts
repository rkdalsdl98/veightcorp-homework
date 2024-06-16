import { tags } from "typia" 

export namespace UserBody {
    export namespace Post {
        export interface Login {
            email: string & tags.Format<"email">
            pass: string & tags.MaxLength<100>
        }
        export interface SignUp {
            email: string & tags.Format<"email">
            pass: string & tags.MaxLength<100>
        }
    }
}