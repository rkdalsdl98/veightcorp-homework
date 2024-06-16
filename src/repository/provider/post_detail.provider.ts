import { Logger } from "@nestjs/common"
import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

import { ReplyProvider } from "./reply.provider"

import { PrismaService, ERROR } from "../../utils"
import { IPostDetailEntity } from "../entity/post.entity"

const logger: Logger = new Logger("PostDetailProvider")

export namespace PostDetailProvider {
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
            obj: Prisma.postdetailGetPayload<ReturnType<typeof select>> | null
        ) : IPostDetailEntity => {
            if(!obj) throw ERROR.NotFoundData
            return {
                uuid: obj.uuid,
                contents: obj.contents,
                views: obj.views,
                replies: obj.replies.map(ReplyProvider.entity.toJson),
                post_id: obj.post_id,
                deletetAt: obj.post.deletedAt,
                updatedAt: obj.updatedAt,
            }
        }
        export const select = () => Prisma.validator<Prisma.postdetailFindManyArgs>()({
            include: { 
                post: { 
                    select: { deletedAt: true } 
                },
                replies: { include: ReplyProvider.entity.select().include },
            }
        })

        export const findUnique = async (
            args: Prisma.postdetailFindUniqueArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).postdetail
        .findUnique({
            ...args,
            include: select().include,
        })
        .then(toJson)
        .catch(exception.handle)

        export const update = async (
            args: Prisma.postdetailUpdateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.prisma).postdetail
        .update({
            ...args,
            include: select().include,
        })
        .then(toJson)
        .catch(exception.handle)
    }
}