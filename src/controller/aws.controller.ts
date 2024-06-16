import { TypedRoute } from "@nestia/core";
import { Controller, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";

import { AuthGuard, GuardDecorator } from "../midleware/guard";
import { AWSService } from "../service/aws.service";
import { Payload } from "../utils/jwt";
import { ERROR } from "../utils";

import * as dotenv from "dotenv"
dotenv.config()

@Controller("aws")
export class AWSController {
    constructor(
        private readonly service: AWSService,
    ) {}

    @TypedRoute.Post()
    @UseInterceptors(FilesInterceptor('files', 1))
    @UseGuards(AuthGuard)
    async upload(
        @GuardDecorator.getAuthResult() payload: Payload,
        @UploadedFiles() files: Express.MulterS3.File[]
    ) {
        try {
            if(payload.expired) throw ERROR.UnAuthorized
            const data = await this.service.uploadImage(files[0])
            return {
                data,
                status: 201,
            }
        } catch(e) { return e }
    }
}