import { Logger } from "@nestjs/common"
import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

import { PrismaService, ERROR } from "../../utils"
import { IReplyEntity } from "../entity/reply.entity"

const logger: Logger = new Logger("UserProvider")

export namespace ReplyProvider {
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
            obj: Prisma.replyGetPayload<ReturnType<typeof select>> | null
        ) : IReplyEntity => {
            if(!obj) throw ERROR.NotFoundData
            return {
                uuid: obj.uuid,
                contents: obj.contents,
                writer_email: obj.writer_email,
                detail_id: obj.detail_id,
                comment_id: obj.comment_id,
                createdAt: obj.createdAt,
                deletedAt: obj.deletedAt,
            }
        }
        export const select = () => Prisma.validator<Prisma.replyFindManyArgs>()({
            include: { detail: false }
        })

        export const create = async (
            args: Prisma.replyCreateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).reply
        .create({
            ...args,
            include: select().include,
        })
        .then(res => !!res)
        .catch(exception.handle)

        export const update = async (
            args: Prisma.replyUpdateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).reply
        .update({
            ...args,
            include: select().include,
        })
        .then(toJson)
        .catch(exception.handle)
    }
}