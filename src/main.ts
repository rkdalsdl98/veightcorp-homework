import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

import { readFileSync } from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config()

async function bootstrap() {
  const port = process.env.SERVER_PORT ?? "3000"

  const httpsOptions : HttpsOptions = {
    key: readFileSync(path.join("./private/keys/private-key.pem")),
    cert: readFileSync(path.join("./private/keys/cert.pem")),
  }
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: `*`,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  app.use(cookieParser())

  await app.listen(port)
  .then(_=> Logger.log(`API 서버 초기화 ✅ : 대기 포트 => ${port}`, "APIServer"))
}
bootstrap()
