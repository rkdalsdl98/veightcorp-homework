import { tags } from "typia"

export interface UserCreateArgs {
    email: string & tags.Format<"email">
    pass: string & tags.MaxLength<100>
    salt: string & tags.MaxLength<34>
}