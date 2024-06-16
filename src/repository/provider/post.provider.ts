import { assert } from "typia"

import { Logger } from "@nestjs/common"
import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

import { PrismaService, ERROR } from "../../utils"
import { IPostEntity, PostCategory } from "../entity/post.entity"

const logger: Logger = new Logger("PostProvider")

export namespace PostProvider {
    export namespace exception {
        export const handle = (e: Error) => {
            if(e instanceof PrismaClientKnownRequestError) {
                if(e.code >= "P1000" && e.code <= "P1999") PrismaService.handlePrismaKnownRequestCommonException(e, "Server")
                else if(e.code >= "P2000" && e.code <= "P2999") PrismaService.handlePrismaKnownRequestQueryException(e)
                else logger.error(e.message)
            } else logger.error(`[데이터베이스 외의 요인으로 인한 오류]\n${e}`)
            throw ERROR.ServerDatabaseError
        }
    }

    export namespace entity {
        export const toJson = (
            obj: Prisma.postGetPayload<ReturnType<typeof select>> | null
        ) : IPostEntity => {
            if(!obj) throw ERROR.NotFoundData
            return {
                uuid: obj.uuid,
                category: assert<PostCategory>(obj.category),
                title: obj.title,
                writer_email: obj.writer_email,
                detail_id: obj.detail!.uuid,
                createdAt: obj.createdAt,
                deletetAt: obj.deletedAt,
            }
        }
        export const select = () => Prisma.validator<Prisma.postFindManyArgs>()({
            include: { detail: { select: { uuid: true } } },
        })

        export const findUnique = async (
            args: Prisma.postFindUniqueArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).post
        .findUnique({
            ...args,
            include: select().include,
        })
        .then(toJson)
        .catch(exception.handle)

        export const findMany = async (
            args: Prisma.postFindManyArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).post
        .findMany({
            ...args,
            include: select().include,
        })
        .then(entities => entities.map(toJson))
        .catch(exception.handle)

        export const create = async (
            args: Prisma.postCreateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).post
        .create({
            ...args,
            include: select().include,
        })
        .then(res => !!res)
        .catch(exception.handle)

        export const update = async (
            args: Prisma.postUpdateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).post
        .update({
            ...args,
            include: select().include,
        })
        .then(toJson)
        .catch(exception.handle)
    }
}