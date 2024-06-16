import { assert } from "typia"

import { Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { IUserEntity, UserAuthority } from "../entity/user.entity";
import { PrismaService, ERROR } from "../../utils"

const logger: Logger = new Logger("UserProvider")

export namespace UserProvider {
    export namespace exception {
        export const handle = (e: Error) => {
            if(e instanceof PrismaClientKnownRequestError) {
                if(e.code >= "P1000" && e.code <= "P1999") PrismaService.handlePrismaKnownRequestCommonException(e, "Server")
                else if(e.code >= "P2000" && e.code <= "P2999") PrismaService.handlePrismaKnownRequestQueryException(e)
                else logger.error(e.message)
            } else logger.error(`[데이터베이스 외의 요인으로 인한 오류]\n${e.message}`)
            throw ERROR.NotFoundData
        }
    }

    export namespace entity {
        export const toJson = (
            obj: Prisma.userGetPayload<ReturnType<typeof select>> | null
        ) : IUserEntity => {
            if(!obj) throw ERROR.NotFoundData
            return {
                uuid: obj.uuid,
                email: obj.email,
                pass: obj.pass,
                salt: obj.salt,
                authorities: obj.authorities.map(entity => {
                    return assert<UserAuthority>(entity.authority)
                }),
            }
        }
        export const select = () => Prisma.validator<Prisma.userFindManyArgs>()({
            include: { authorities: true }
        })

        export const findUnique = async (
            args: Prisma.userFindUniqueArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).user
        .findUnique({
            ...args,
            include: select().include
        })
        .then(toJson)
        .catch(exception.handle)

        export const create = async (
            args: Prisma.userCreateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).user
        .create(args)
        .then(res => !!res)
        .catch(exception.handle)

        export const update = async (
            args: Prisma.userUpdateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).user
        .update(args)
        .then(res => !!res)
        .catch(exception.handle)

        export const remove = async (
            args: Prisma.userDeleteArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).user
        .delete(args)
        .then(res => !!res)
        .catch(exception.handle)
    }
}