import { IUserEntity } from "../../repository/entity/user.entity"

export interface UserDto {
    email: string
}

export const toUserDto = (entity: IUserEntity): UserDto => ({
    email: entity.email
})