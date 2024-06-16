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
                    secure: true,
                    httpOnly: true,
                    sameSite: "none",
                    domain: "localhost",
                    path: "/",
                    maxAge: parseInt(process.env.COOKIE_MAXAGE ?? "0"),
                }
            )
            response.cookie(
                "refresh",
                `${refreshtoken}`,
                {
                    secure: true,
                    httpOnly: true,
                    sameSite: "none",
                    domain: "localhost",
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
                        secure: true,
                        httpOnly: true,
                        sameSite: "none",
                        domain: "localhost",
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
            secure: true,
            httpOnly: true,
            domain: "localhost",
            sameSite: "none",
            path: "/",
            maxAge: 0,
        })
    }
}