import { Injectable } from "@nestjs/common";
import multerS3 from 'multer-s3';
import * as AWS from "aws-sdk";

import { Security } from "../utils";

import * as dotenv from "dotenv"
dotenv.config()

@Injectable()
export class AWSService {
    private readonly s3: AWS.S3
    private readonly bucketName: string

    constructor(){
        AWS.config.update({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS ?? "",
                secretAccessKey: process.env.AWS_PRIVATE ?? "",
            },
        })
        this.bucketName = process.env.AWS_BUCKET_NAME ?? ""
        this.s3 = new AWS.S3()
    }

    async uploadImage(file: Express.MulterS3.File) {
        const key = `${Security.getRandNanoId() + file.originalname}`
        const param: AWS.S3.Types.PutObjectRequest = {
            Bucket: this.bucketName,
            ACL: 'private',
            Key: key,
            Body: file.buffer,
        }
        return new Promise((res, rej) => {
            this.s3.putObject(param, (err, _) => {
                if(err) rej(err)
                else res(process.env.AWS_URI + key)
            })
        })
    }
}