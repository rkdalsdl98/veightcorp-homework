import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { Controller, UseGuards } from "@nestjs/common";

import { PostService } from "../service/post.service";
import { PostParam } from "./param/post.param";
import { PostBody } from "./body/post.body";
import { AuthGuard, GuardDecorator } from "../midleware/guard";
import { Payload } from "../utils/jwt";
import { ERROR } from "../utils";

@Controller('post')
export class PostController {
    constructor(
        private readonly service: PostService,
    ){}

    /**
     * 주어진 쿼리 파라미터에 따라 다른 결과를 반환합니다.
     * 
     * @param {PostParam.Get.Search} query 
     * @returns 게시글을 조회합니다.
     * 
     * @tag Post Public
     */
    @TypedRoute.Get()
    async search(
        @TypedQuery() query: PostParam.Get.Search
    ) {
        try {   
            const data = await this.service.search({
                title: query.title,
                writer_email: query.writer_email,
                withBy: query.withBy,
                orderBy: query.createdAt || query.viewAt
                ? { createdAt: query.createdAt, views: query.viewAt }
                : undefined,
            })
            return {
                data,
                status: 200
            }
        } catch(e) { return e }
    }

    /**
     * @param {string} id 
     * @returns 게시글의 상세정보를 반환합니다.
     * 
     * @tag Post Public
     */
    @TypedRoute.Get(":id")
    async getDetail(
        @TypedParam("id") id: string
    ) {
        try {   
            const data = await this.service.findDetail(id)
            return {
                data,
                status: 200
            }
        } catch(e) { return e }
    }

    /**
     * 토큰이 만료되었다면 에러를 쓰로잉 합니다.
     * 
     * @param {PostBody.Post.Create} body 
     * @returns 게시글 작성 여부를 반환합니다.
     * 
     * @tag Post Private
     */
    @TypedRoute.Post()
    @UseGuards(AuthGuard)
    async write(
        @TypedBody() body: PostBody.Post.Create,
        @GuardDecorator.getAuthResult() payload: Payload
    ) {
        try {
            if(payload.type === "refresh") throw ERROR.UnAuthorized
            const data = await this.service.write(
                body.title,
                body.category,
                payload.data,
                body.contents,
            )
            return {
                data,
                status: 201,
            }
        } catch(e) { return e }
    }
    
    /**
     * 토큰이 만료되었다면 에러를 쓰로잉 합니다.
     * 
     * @param {PostBody.Patch.Update} body 
     * @returns 게시글 수정 여부를 반환합니다.
     * 
     * @tag Post Private
     */
    @TypedRoute.Patch()
    @UseGuards(AuthGuard)
    async edit(
        @TypedBody() body: PostBody.Patch.Update,
        @GuardDecorator.getAuthResult() payload: Payload
    ) {
        try {
            if(payload.type === "refresh") throw ERROR.UnAuthorized
            const data = await this.service.edit(
                body.post_id,
                payload.data,
                body.category,
                {
                    title: body.title,
                    contents: body.contents,
                }
            )
            return {
                data,
                status: 200,
            }
        } catch(e) { return e }
    }

    /**
     * 토큰이 만료되었다면 에러를 쓰로잉 합니다.
     * 
     * @param {PostBody.Delete.Remove} body 
     * @returns 게시글 삭제 여부를 반환합니다.
     * 
     * @tag Post Private
     */
    @TypedRoute.Delete()
    @UseGuards(AuthGuard)
    async delete(
        @TypedBody() body: PostBody.Delete.Remove,
        @GuardDecorator.getAuthResult() payload: Payload
    ) {
        try {
            if(payload.type === "refresh") throw ERROR.UnAuthorized
            const data = await this.service.delete(
                body.post_id,
                payload.data,
                body.category,
            )
            return {
                data,
                status: 200,
            }
        } catch(e) { return e }
    }
}