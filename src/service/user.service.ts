import { Injectable } from "@nestjs/common";

import { UserRepository } from "../repository/user.repository";
import { ERROR, Security, JWTFactory } from "../utils";
import { UserDto, toUserDto } from "./dto/user.dto";
import { Payload } from "src/utils/jwt";

@Injectable()
export class UserService {
    constructor(
        private readonly repository: UserRepository,
    ){}

    public async logIn(
        email: string,
        pass: string,
    ) : Promise<{ user: UserDto, accesstoken: string, refreshtoken: string }> {
        const entity = await this.repository.findUserByEmail(email)
        const verify = Security.verify(
            pass,
            entity.salt,
            entity.pass,
        )

        if(!verify) {
            let err = ERROR.UnAuthorized
            err.substatus = "NotEqualPass"
            throw err
        }

        const accesstoken = await this._publishToken(email)
        const refreshtoken = await this._publishToken(email, true)

        const user = toUserDto(entity)
        return {
            user,
            accesstoken,
            refreshtoken,
        }
    }

    public async tokenLogIn(payload: Payload) : Promise<{ user: UserDto, accesstoken?: string }> {
        return await this._getUserDtoByPayload(payload)
    }

    public async signUp(
        email: string,
        pass: string,
    ): Promise<boolean> {
        const { salt, hash } = Security.encryption(pass)
        return await this.repository.signUp({
            email,
            pass: hash,
            salt,
        })
    }

    public async signOut(email: string) {
        return await this.repository.signOut(email)
    }

    private async _publishToken(email: string, isRefresh: boolean = false) : Promise<string> {
        return await JWTFactory.publishToken({ email }, isRefresh)
    }

    /**
     * accesstoken과 refreshtoken 모두 만료 되었다면 Error를 쓰로잉하고
     * 
     * refreshtoken은 유효하고 accesstoken이 만료되었을 경우 accesstoken을 재발행해서 반환한다.
     * @param payload 
     * @returns 
     */
    private async _getUserDtoByPayload(payload: Payload)
    : Promise<{ user: UserDto, accesstoken?: string }> {
        let accesstoken: string | undefined = undefined

        if(payload.type === "refresh") {
            if(payload.expired) throw ERROR.UnAuthorized
            accesstoken = await this._publishToken(payload.data)
        }

        return await this.repository.findUserByEmail(payload.data)
        .then(entity => {
            return {
                user: toUserDto(entity),
                accesstoken,
            }
        })
    }
}