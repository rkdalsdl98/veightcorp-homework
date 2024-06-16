import { Module } from "@nestjs/common";

import { AWSController } from "../controller/aws.controller";
import { AWSService } from "../service/aws.service";

@Module({
    providers: [AWSService],
    controllers: [AWSController],
    exports: [AWSService],
})
export default class AWSModule {}