import { Injectable } from "@nestjs/common";

import { PostRepository } from "../repository/post.repository";
import { PostDetailDto, PostDto, toPostDetailDto, toPostDto } from "./dto/post.dto";
import { PostCategory } from "src/repository/entity/post.entity";
import { IPostCache } from "./interface/post.interface";
import RedisService from "./redis.service";
import { ERROR } from "../utils";

import * as dotenv from "dotenv"
dotenv.config()

@Injectable()
export class PostService {
    private readonly critical_point = parseInt(process.env.POST_DETAIL_CRITICAL_POINT ?? "1000")
    private readonly one_day = 1000 * 60 * 60 * 24
    private readonly seven_week = this.one_day * 7
    private readonly one_month = this.one_day * 30
    private readonly one_year = this.one_day * 365

    constructor(
        private readonly repository: PostRepository,
        private readonly redis: RedisService,
    ){}

    public async search({
        title,
        writer_email,
        orderBy,
        withBy,
    } : Partial<{
        title: string,
        writer_email: string,
        orderBy: { createdAt?: "asc" | "desc", views?: "asc" | "desc" },
        withBy: "week" | "month" | "year",
    }>) : Promise<PostDto[]> {
        let startwith : Date | undefined = undefined

        if(withBy) {
            switch(withBy) {
                case "week":
                    startwith = new Date(Date.now() - this.seven_week)
                    break
                case "month":
                    startwith = new Date(Date.now() - this.one_month)
                    break
                case "year":
                    startwith = new Date(Date.now() - this.one_year)
                    break
                default:
                    throw ERROR.BadRequest
            }
        }

        return await this.repository.search({
            title,
            writer_email,
            startwith,
            orderBy,
        })
        .then(entities => {
            const posts: PostDto[] = []
            for(let i=0; i<entities.length; ++i) if(entities[i].deletetAt === null) posts.push(toPostDto(entities[i]))
            return posts
        })
    }

    public async findDetail(detail_id: string) : Promise<PostDetailDto> {
        // const cache = await this.redis.get<IPostCache>(detail_id, PostService.name)
        // if(cache) {
        //     ++cache.views

        //     if((cache.load_factor * this.critical_point) / cache.views <= 1) {
        //         // 현재 조회수가 기준치에 도달 했을 경우

        //         // 기준 값을 증가
        //         ++cache.load_factor
        //         cache.updatedAt = new Date()
    
        //         // DB의 정보와 캐시 값을 동기화
        //         this.repository.updatePost({
        //             uuid: detail_id,
        //             views: cache.views,
        //         })
        //     }

        //     // 캐시 값을 갱신
        //     this.redis.set(
        //         detail_id,
        //         cache,
        //         PostService.name,
        //         parseInt(process.env.POST_DETAIL_TTL ?? "1"),
        //     )

        //     return {
        //         uuid: detail_id,
        //         contents: cache.contents,
        //         views: cache.views,
        //         replies: cache.replies,
        //         updatedAt: new Date(cache.updatedAt),
        //     }
        // }

        const entity = await this.repository.findDetail({ detail_id })
        if(entity.deletetAt) throw ERROR.NotFoundData
        // ++entity.views

        // 조회한 데이터를 캐싱
        // this.redis.set(
        //     detail_id, 
        //     {
        //         contents: entity.contents,
        //         replies: entity.replies,
        //         views: entity.views,
        //         load_factor: Math.ceil(entity.views % this.critical_point === 0 ? (entity.views + 1) / this.critical_point : entity.views / this.critical_point),
        //         deletedAt: entity.deletetAt,
        //         updatedAt: entity.updatedAt,
        //     } satisfies IPostCache, 
        //     PostService.name,
        //     parseInt(process.env.POST_DETAIL_TTL ?? "1"),
        // )

        return toPostDetailDto(entity)
    }

    public async write(
        title: string,
        category: PostCategory,
        writer_email: string,
        contents: string,
    ) : Promise<boolean> {
        return await this.repository.create({
            title,
            category,
            writer_email,
            detail: { contents },
        })
    }

    public async edit(
        post_id: string,
        writer_email: string,
        category: PostCategory,
        {
            title,
            contents,
        } : Partial<{ title: string, contents: string }>
    ) : Promise<boolean> {
        return await this.repository.updatePost({
            uuid: post_id,
            writer_email,
            category,
            title,
            contents,
        })
        .then(async entity => {
            if(!entity) return false
            const cache = await this.redis.get<IPostCache>(entity.detail_id, PostService.name)
            if(cache) {
                cache.contents = contents ?? cache.contents
                this.redis.set(entity.detail_id, cache, PostService.name, parseInt(process.env.POST_DETAIL_TTL ?? "1"))
            }
            return true
        })
    }

    public async delete(
        post_id: string,
        writer_email: string,
        category: PostCategory,
    ) : Promise<boolean> {
        const deletedAt = new Date()
        const cache = await this.redis.get<IPostCache>(post_id, PostService.name)

        return await this.repository.delete({
            uuid: post_id,
            writer_email,
            deletedAt,
            category,
        })
        .then(res => {
            if(res) {
                if(cache) {
                    cache.deletedAt = deletedAt
                    this.redis.set(post_id, cache, PostService.name, parseInt(process.env.POST_DETAIL_TTL ?? "1"))
                }
            }
            return res
        })
    }
}