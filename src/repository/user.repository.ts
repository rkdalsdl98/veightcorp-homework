import { Injectable } from "@nestjs/common";

import { UserProvider } from "./provider/user.provider";
import { UserCreateArgs } from "./interface/user.interface";
import { IUserEntity } from "./entity/user.entity";

@Injectable()
export class UserRepository {
    async findUserByEmail(email: string): Promise<IUserEntity> {
        return await UserProvider
        .entity
        .findUnique({
            where: { email }
        })
    }
    
    async signUp(args: UserCreateArgs): Promise<boolean> {
        return await UserProvider
        .entity
        .create({
            data: {
                email: args.email,
                pass: args.pass,
                salt: args.salt,
                authorities: {
                    create: { authority: "consumer" }
                }
            }
        })
    }

    async signOut(email: string): Promise<boolean> {
        return await UserProvider
        .entity
        .remove({
            where: { email }
        })
    }
}