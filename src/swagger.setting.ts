import { INestApplication } from "@nestjs/common";
import { readFileSync } from "fs";
import { SwaggerModule } from '@nestjs/swagger';

import * as path from "path";

export const SwaggerSetting = (app: INestApplication) : void => {
    const swaggerConfig = readFileSync(path.join(__dirname,"../../src/swagger/swagger.json"), 'utf-8')
    SwaggerModule.setup('api', app, JSON.parse(swaggerConfig))
}