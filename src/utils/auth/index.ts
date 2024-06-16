import { pbkdf2Sync } from "crypto"
import { nanoid } from "nanoid"

export namespace Security {
    export const getRandNanoId = (size?: number) => nanoid(size ?? 32) 
    
    /**
     * json 형식의 data를 사용 할 경우 JSON.stringify를 사용 해 string으로 타입변환해서 사용 할 것
     * 
     * @param data
     * @param options 
     * @returns 
     */
    export const encryption = (
        data: string,
        options: EncryptionOptions = {}
    ) : EncryptionResult => {
        const salt: string = options.salt ?? getRandNanoId()
        const buffer : Buffer = Buffer.from(data, options.buffer_encoding ?? "utf-8")
        const hash = pbkdf2Sync(
            buffer, 
            salt, 
            options.interation ?? 10000, 
            options.key_len ?? 64, 
            options.algorithm ?? "sha256",
        ).toString(options.str_encoding ?? "base64")

        return { salt, hash }
    }
    
    /**
     * json 형식의 data를 사용 할 경우 JSON.stringify를 사용 해 string으로 타입변환해서 사용 할 것
     * 
     * @param data
     * @param options 
     * @returns 
     */
    export const verify = (
        data: string, 
        salt: string, 
        comparedHash: string
    ) => {
        const { hash } = encryption(data, { salt })
        return hash === comparedHash
    }
}

import { tags } from "typia"

export type EncryptionResult = {
    salt: string & tags.MinLength<32> & tags.MaxLength<34>
    hash: string & tags.MinLength<32> & tags.MaxLength<66>
}

export type EncryptionOptions = Partial<{
    salt: string & tags.MinLength<32> & tags.MaxLength<34>
    buffer_encoding: BufferEncoding
    str_encoding: BufferEncoding
    interation: number & tags.MinLength<10000> & tags.MaxLength<100000>
    key_len: number & tags.MinLength<32> & tags.MaxLength<64>
    algorithm: EncryptionDigest
}>

export type EncryptionDigest = 
| "sha224"
| "sha256"
| "sha512"