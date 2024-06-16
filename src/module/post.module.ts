import { Module } from "@nestjs/common";

import { PostController } from "../controller/post.controller";
import { PostService } from "../service/post.service";
import { PostRepository } from "../repository/post.repository";

import RedisModule from "./redis.module";

@Module({
    imports: [
        RedisModule,
    ],
    providers: [
        PostService,
        PostRepository,
    ],
    controllers: [PostController],
})
export default class PostModule {}