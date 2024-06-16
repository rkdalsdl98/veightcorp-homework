import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { JWTFactory, ERROR } from "../../utils";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext)
    : boolean {
        const req = context.switchToHttp().getRequest()
        const { methods } = req.route
        const method = Object.keys(methods)[0]
        const reqAddress: string | undefined = getRequestIP(req)
        const tokens = extractTokenFromCookie(req)
        
        if((method === (undefined || null))
        || (reqAddress === (undefined || null))
        || (tokens === null)) throw new HttpException(ERROR.UnAuthorized.message, ERROR.UnAuthorized.status)
        
        try {
            const { accesstoken, refreshtoken } = tokens!
            const accessPayload = JWTFactory.verifyToken(accesstoken)
            accessPayload.type = "access"

            if(accessPayload.expired) {
                const refreshPayload = JWTFactory.verifyToken(refreshtoken)
                refreshPayload.type = "refresh"
                req.user = refreshPayload
            } else req.user = accessPayload
            return true
        } catch(e) {
            if("message" in e && "status" in e) throw new HttpException(e.message, e.status)
            throw new HttpException("유효하지 않은 요청입니다.", HttpStatus.UNAUTHORIZED)
        }
    }
}

import { createParamDecorator } from "@nestjs/common";
import { Payload } from "../../utils/jwt";

export namespace GuardDecorator {
    export const getAuthResult = createParamDecorator((
        _,
        context: ExecutionContext,
    ) : Payload => {
        const { user: payload } = context.switchToHttp().getRequest()
        return payload
    })
}

import { Request } from "express"

export const extractTokenFromCookie = (request: Request)
: { accesstoken: string, refreshtoken: string } | null => {
    const accesstoken : string = request.cookies['access']
    const refreshtoken : string = request.cookies['refresh']
    if(accesstoken !== undefined && refreshtoken !== undefined) return { accesstoken, refreshtoken }
    return null
}

export const getRequestIP = (req: Request)
: string | undefined => {
    const address: string | undefined = req.socket.remoteAddress
    if(!address) return undefined
    
    const pureAddr = address.match(/([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3})/)
    if(!pureAddr) return "localhost"
    return pureAddr[0]
}
