import { Test, TestingModule } from "@nestjs/testing";

import { JWTFactory } from "../utils";

import { UserService } from "../service/user.service";
import { UserRepository } from "../repository/user.repository";
import UserModule from "../module/user.module";

describe("유저 서비스 유닛 테스트", () => {
    let service: UserService
    let repository: UserRepository

    let data = {
        email: "tester@gmail.com",
        pass: "123456"
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule],
            providers: [
                UserService,
                UserRepository,
            ]
        })
        .compile()

        service = module.get<UserService>(UserService)
        repository = module.get<UserRepository>(UserRepository)

    })

    describe("0, 테스트 환경 확인", () => {
        it("0-1, service, repository 선언 확인", () => {
            expect(service).toBeDefined()
            expect(repository).toBeDefined()
        })
    })

    let accesstoken: string
    let refreshtoken: string

    describe("1, 로그인/회원가입 로직 검증", () => {
        it("1-1, 회원가입 성공 시 True를 반환", async () => {
            const result = await service.signUp(
                data.email,
                data.pass,
            )
            expect(result).toEqual<boolean>(true)
        })

        it("1-2, [일반 로그인] 로그인 시 액세스, 리프레시 토큰과 함께 유저 DTO를 반환", async () => {
            const result = await service.logIn(
                data.email,
                data.pass,
            )

            accesstoken = result.accesstoken
            refreshtoken = result.refreshtoken

            expect(accesstoken).toBeDefined()
            expect(refreshtoken).toBeDefined()
            expect(result.user).toBeDefined()
        })

        it("1-3, [토큰 로그인] 전달 받은 토큰을 검증하고 유효 하다면 유저 DTO를 반환", async () => {
            const accessPayload = JWTFactory.verifyToken(accesstoken)
            accessPayload.type = "access"

            expect(accessPayload).toBeDefined()
            expect(accessPayload.data).toBeDefined()
            expect(typeof accessPayload.data === "string").toEqual(true)
            expect(accessPayload.expired).toEqual(false)

            const result = await service.tokenLogIn(accessPayload)
            expect(result.user).toBeDefined()
        })

        it("1-4, [토큰 로그인] 액세스 토큰이 만료되었을 경우, 리프레시 토큰으로 액세스 토큰을 재발급한 이후 1-3 과정을 반복", async () => {
            const refreshPayload = JWTFactory.verifyToken(accesstoken)
            refreshPayload.type = "refresh"

            expect(refreshPayload).toBeDefined()
            expect(refreshPayload.data).toBeDefined()
            expect(typeof refreshPayload.data === "string").toEqual(true)
            expect(refreshPayload.expired).toEqual(false)

            const result = await service.tokenLogIn(refreshPayload)

            expect(result.user).toBeDefined()
            expect(result.accesstoken).toBeDefined()

            accesstoken = result.accesstoken!
        })
    })
})