import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import * as redisStore from 'cache-manager-ioredis';

import RedisService from "../service/redis.service";

import * as dotenv from "dotenv"

dotenv.config()

@Module({
    imports: [
        CacheModule.register({
            store: redisStore,
            host: process.env.SERVER_IP,
            port: process.env.REDIS_PORT,
            isGlobal: true,
        })
    ],
    providers: [RedisService],
    exports: [RedisService]
})
export default class RedisModule {}