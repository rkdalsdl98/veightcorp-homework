import { tags } from "typia"

export interface IUserEntity {
    /** PK */
    uuid: string & tags.MaxLength<32>
    
    /** 사용자 이메일 */
    email: string & tags.Format<"email">

    /** 사용자 비밀번호 (암호화) */
    pass: string & tags.MaxLength<100>

    /** 암호화된 비밀번호 검증에 필요한 데이터 */
    salt: string & tags.MaxLength<34>

    authorities: UserAuthority[]
}

export type UserAuthority = ("consumer" | "admin") & tags.MaxLength<10>