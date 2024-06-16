import { Module } from "@nestjs/common";

import { UserController } from "../controller/user.controller";
import { UserService } from "../service/user.service";
import { UserRepository } from "../repository/user.repository";

@Module({
    providers: [
        UserService,
        UserRepository,
    ],
    controllers: [UserController],
})
export default class UserModule {}