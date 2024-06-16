import { TypedBody, TypedRoute } from "@nestia/core";
import { Controller, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { UserService } from "../service/user.service";
import { UserBody } from "./body/user.body";
import { AuthGuard, GuardDecorator } from "../midleware/guard";
import { Payload } from "../utils/jwt";

@Controller('user')
export class UserController {
    constructor(
        private readonly service: UserService,
    ){}

    /**
     * @param {UserBody.Post.Login} body 
     * @returns 로그인에 성공하면 쿠키에 토큰정보를 저장하고, 유저 정보를 반환합니다.
     * 
     * @tag User Public
     */
    @TypedRoute.Post("login")
    async login(
        @Res() response: Response,
        @TypedBody() body: UserBody.Post.Login
    ) {
        try {
            const { user, accesstoken, refreshtoken } = await this.service.logIn(
                body.email,
                body.pass,
            )

            response.cookie(
                "access",
                `${accesstoken}`,
                {
                    httpOnly: true,
                    domain: "*",
                    path: "/",
                    maxAge: parseInt(process.env.COOKIE_MAXAGE ?? "0"),
                }
            )
            response.cookie(
                "refresh",
                `${refreshtoken}`,
                {
                    httpOnly: true,
                    domain: "*",
                    path: "/",
                    maxAge: parseInt(process.env.COOKIE_MAXAGE ?? "0"),
                }
            )

            response.json({
                data: user,
                status: 201,
            })
        } catch(e) {
            response
            .json({
                status: e.status,
                message: e.message,
                substatus: e.substatus,
            })
        }
    }

    /**
     * 액세스 토큰이 만료되었을 경우, 새로운 액세스 토큰을 반환하고, 쿠키를 갱신합니다.
     * 
     * 리프레시 토큰이 만료되었을 경우, 쿠키에 담긴 토큰정보를 삭제하고, 재 로그인을 유도합니다.
     * 
     * @returns 토큰이 유효하다면 유저 정보를 반환합니다.
     * 
     * @tag User Private
     */
    @TypedRoute.Post("login/token")
    @UseGuards(AuthGuard)
    async tokenLogin(
        @Res() response: Response,
        @GuardDecorator.getAuthResult() payload: Payload
    ) {
        try {
            const data = await this.service.tokenLogIn(payload)
            if(data.accesstoken) {
                response.cookie(
                    "access",
                    `${data.accesstoken}`,
                    {
                        httpOnly: true,
                        domain: "*",
                        path: "/",
                        maxAge: parseInt(process.env.COOKIE_MAXAGE ?? "0"),
                    }
                )
            }

            response.json({
                data: data.user,
                status: 201,
            })
        } catch(e) {
            if(e.status === 401) {
                this._setDeleteCookie(response, "access")
                this._setDeleteCookie(response, "refresh")
            }
            response
            .json({
                status: e.status,
                message: e.message,
                substatus: e.substatus,
            })
        }
    }


    /**
     * @param body 
     * @returns 회원가입에 성공 여부를 반환합니다.
     * 
     * @tag User Public
     */
    @TypedRoute.Post("sign")
    async signUp(
        @TypedBody() body: UserBody.Post.SignUp
    ) {
        try {
            const data = await this.service.signUp(body.email, body.pass)
            return {
                data,
                status: 201,
            }
        } catch(e) { return e }
    }


    private _setDeleteCookie(response: Response, name: string) {
        response.cookie(
            name, 
            "", 
        {
            httpOnly: true,
            domain: "*",
            path: "/",
            maxAge: 0,
        })
    }
}