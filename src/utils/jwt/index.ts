import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";

import * as dotenv from "dotenv"

dotenv.config()

const jwtService = new JwtService({ 
    global: false,
    secret: process.env.JWT_SECRET,
    signOptions: {
        algorithm: "HS256",
    },
    verifyOptions: {
        ignoreExpiration: true,
    }
})
const logger: Logger = new Logger("JWTFactory")

export namespace JWTFactory {
    export const publishToken = async (
        payload: Buffer | Object, 
        isRefresh: boolean = false,
    ) : Promise<string> => {
        const expiresIn = (isRefresh ? process.env.JWT_EXPIRATION_AT_DAY_REFRESH : process.env.JWT_EXPIRATION_AT_DAY) ?? "1d"
        //const expiresIn = (isRefresh ? process.env.JWT_EXPIRATION_AT_DAY_REFRESH : 1) ?? "1d"
        const token = await jwtService.signAsync(
            payload,
            { expiresIn }
        )
        return token
    }
    
    /**
     * 페이로드에 담길 데이터는 유일성을 만족하고 데이터의 크기가 작아야 한다
     * 
     * 또한 외부에 유출시 피해가 가는 데이터여서는 안됨
     * @param token 
     * @param isRefresh 
     * @returns 
     */
    export const verifyToken = (
        token: string,
    ) : Payload => {
        try {
            if(token !== null) {
                const payload = jwtService.verify(token)
                const { exp, iat } = payload
                if("email" in payload) {
                    return {
                        exp, 
                        iat, 
                        data: payload.email,
                        expired: isExpired(exp),
                    } as Payload
                }
            }
            
            let error = ERROR.UnAuthorized
            error.substatus = "ForgeryData"
            throw error
        } catch(e) {
            if(e instanceof JsonWebTokenError) {
                logger.error(`[비정상적인 토큰 접근]\n서버에서 서명한 토큰이 아닌 토큰으로 요청이 들어왔습니다.\n${e.toString()}`)
                let error = ERROR.UnAuthorized
                error.substatus = "ForgeryData"
                throw error
            }
            throw e
        }
    }

    export const isExpired = (exp: number) : boolean => {
        const now = new Date(Date.now())
        const exp_date = new Date(exp * 1000)
        return now > exp_date
    }
}

import { tags } from "typia"
import { ERROR } from "../error";

export type Payload = {
    data: string & tags.Format<"email">
    expired: boolean
    exp: number & tags.MaxLength<11>
    iat: number & tags.MaxLength<11>
    type: "access" | "refresh"
}