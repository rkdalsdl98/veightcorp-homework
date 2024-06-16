import { tags } from "typia"

export namespace PostParam {
    export namespace Get {
        export interface Search {
            title?: string & tags.MaxLength<100>
            writer_email?: string & tags.Format<"email">
            withBy?: "year" | "month" | "week"
            createdAt?: "asc" | "desc"
            viewAt?: "asc" | "desc"
        }
    }
}