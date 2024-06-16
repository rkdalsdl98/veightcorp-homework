import { Module } from '@nestjs/common';

import UserModule from './module/user.module';
import PostModule from './module/post.module';
import ReplyModule from './module/reply.module';
import RedisModule from './module/redis.module';
import AWSModule from './module/aws.module';

@Module({
  imports: [
    UserModule,
    PostModule,
    AWSModule,
    ReplyModule,
    RedisModule,
  ],
})
export class AppModule {}
