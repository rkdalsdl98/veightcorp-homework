import { Injectable } from "@nestjs/common";

import { PostCreateArgs, PostDeleteArgs, PostFindManyArgs, PostUpdateArgs } from "./interface/post.interface";
import { PostDetailFindArgs } from "./interface/post_detail.interface";
import { IPostEntity } from "./entity/post.entity";

import { ERROR, PrismaService } from "../utils";
import { PostProvider } from "./provider/post.provider";
import { PostDetailProvider } from "./provider/post_detail.provider";
import { UserProvider } from "./provider/user.provider";

@Injectable()
export class PostRepository {
    async search(args: PostFindManyArgs): Promise<IPostEntity[]> {
        return await PostProvider
        .entity
        .findMany({
            where: {
                title: args.title 
                ? {
                    contains: args.title
                }
                : undefined,
                writer_email: args.writer_email,
                AND: args.startwith ? {
                    createdAt: {
                        gte: args.startwith
                    }
                } : undefined
            },
            orderBy: args.orderBy 
            ? [
                {
                    detail: args.orderBy.views ? {
                        views: args.orderBy?.views,
                    } : undefined
                },
                {
                    createdAt: args.orderBy?.createdAt
                },
            ]
            : undefined
        })
    }

    async create(args: PostCreateArgs): Promise<boolean> {
        if(args.category === "notice") {
            return await PrismaService.prisma.$transaction<boolean>(async tx => {
                const user = await UserProvider
                .entity
                .findUnique({
                    where: { email: args.writer_email }
                }, tx)
                if(!user || !user.authorities.some(authority => authority === "admin")) throw ERROR.UnAuthorized
            
                return await PostProvider
                .entity
                .create({
                    data: {
                        title: args.title,
                        category: args.category,
                        writer_email: args.writer_email,
                        detail: {
                            create: { contents: args.detail.contents }
                        }
                    }
                }, tx)
                .then(res => !!res)
            })
        }

        return await PostProvider
        .entity
        .create({
            data: {
                title: args.title,
                category: args.category,
                writer_email: args.writer_email,
                detail: {
                    create: { contents: args.detail.contents }
                }
            }
        })
    }

    async updatePost(args: PostUpdateArgs): Promise<IPostEntity> {
        if(args.category === "notice") {
            return await PrismaService.prisma.$transaction<IPostEntity>(async tx => {
                const user = await UserProvider
                .entity
                .findUnique({
                    where: { email: args.writer_email }
                }, tx)
                if(!user || !user.authorities.some(authority => authority === "admin")) throw ERROR.UnAuthorized
            
                return await PostProvider
                .entity
                .update({
                    data: {
                        title: args.title,
                        detail: args.contents ? {
                            update: {
                                contents: args.contents,
                                views: args.views,
                            }
                        } : undefined
                    },
                    where: { uuid: args.uuid, writer_email: args.writer_email }
                }, tx)
            })
        }
        
        return await PostProvider
        .entity
        .update({
            data: {
                title: args.title,
                detail: args.contents ? {
                    update: {
                        contents: args.contents,
                        views: args.views,
                    }
                } : undefined
            },
            where: { uuid: args.uuid, writer_email: args.writer_email }
        })
    }
    
    async delete(args: PostDeleteArgs): Promise<boolean> {
        if(args.category === "notice") {
            return await PrismaService.prisma.$transaction<boolean>(async tx => {
                const user = await UserProvider
                .entity
                .findUnique({
                    where: { email: args.writer_email }
                }, tx)
                if(!user || !user.authorities.some(authority => authority === "admin")) throw ERROR.UnAuthorized
            
                return await PostProvider
                .entity
                .update({
                    data: {
                        deletedAt: args.deletedAt,
                    },
                    where: { 
                        uuid: args.uuid,
                        writer_email: args.writer_email,
                    }
                }, tx)
                .then(res => !!res)
            })
        }

        return await PostProvider
        .entity
        .update({
            data: {
                deletedAt: args.deletedAt,
            },
            where: { 
                uuid: args.uuid,
                writer_email: args.writer_email,
            }
        }).then(res => !!res)
    }

    async findDetail(args: PostDetailFindArgs) {
        return await PostDetailProvider
        .entity
        .update({
            where: { uuid: args.detail_id },
            data: { views: { increment: 1 } }
        })
    }
}