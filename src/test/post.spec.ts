import { Test, TestingModule } from "@nestjs/testing"
import { PrismaClient } from "@prisma/client"

import { PostRepository } from "../repository/post.repository"
import { PostService } from "../service/post.service"
import RedisModule from "../module/redis.module"
import PostModule from "../module/post.module"

describe("게시글 서비스 유닛 테스트", () => {
    let service: PostService
    let repository: PostRepository
    let prisma: PrismaClient

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                RedisModule,
                PostModule,
            ],
            providers: [
                PostService,
                PostRepository,
            ]
        })
        .compile()

        service = module.get<PostService>(PostService)
        repository = module.get<PostRepository>(PostRepository)
        prisma = new PrismaClient()
    })

    describe("0, 테스트 환경 확인", () => {
        it("0-1, service, repository, prisma 선언 확인", () => {
            expect(service).toBeDefined()
            expect(repository).toBeDefined()
            expect(prisma).toBeDefined()
        })
    })

    let admin_email = "admin@admin.com"
    let writer_email = "tester@gmail.com"
    let writer_email2 = "tester2@gmail.com"

    let post1 = {
        title: "테스트1",
        contents: "테스트1 입니다.",
    }
    let post2 = {
        title: "테스트2",
        contents: "테스트2 입니다.",
    }
    let post3 = {
        title: "공지사항",
        contents: "공지사항 입니다.",
    }

    let detailIds: string[] = []
    let noticeDetailId: string
    
    let editData = {
        post_id: "",
        writer_email: "",
        title: "수정된 제목 입니다.",
        contents: "수정된 내용 입니다."
    }
    let editNoticeData = {
        post_id: "",
        title: "수정된 공지사항 제목 입니다.",
        contents: "수정된 공지사항 내용 입니다."
    }

    describe("1, 게시글 생성", () => {
        it("1-1, 권한이 필요하지 않은 게시글 생성", async () => {
            /** 게시글을 생성하고 결과를 체크 */
            const post1CreateResult = await service.write(
                post1.title,
                "q-and-a",
                writer_email,
                post1.contents,
            )
            const post2CreateResult = await service.write(
                post2.title,
                "q-and-a",
                writer_email2,
                post2.contents,
            )

            expect(post1CreateResult).toEqual(true)
            expect(post2CreateResult).toEqual(true)

            /** 생성된 게시글이 진짜 존재하는지 작성자 이메일로 검색 */
            const searchResult = await service.search({})
            detailIds.push(searchResult[0].detail_id)
            detailIds.push(searchResult[1].detail_id)
            expect(searchResult.length).toEqual(2)
            expect(detailIds.length).toEqual(2)
        })

        it("1-2, 권한이 필요한 게시글 생성 시 조건을 충족하지 않는 다면 오류를 반환", async () => {
            try {
                await service.write(
                    post3.title,
                    "notice",
                    writer_email,
                    post3.contents,
                )
            } catch(e) {
                expect(e.status).toEqual(401)
                expect(e.message).toEqual("해당 요청에 필요한 자격 증명에 실패 했습니다.")
            }
        })

        it("1-3, 권한이 필요한 게시글 생성 시 조건을 충족 한다면 정상 작동", async () => {
            const postCreateResult = await service.write(
                post3.title,
                "notice",
                admin_email,
                post3.contents,
            )

            expect(postCreateResult).toEqual(true)

            /** 생성된 게시글이 진짜 존재하는지 작성자 이메일로 검색 */
            const searchResult = await service.search({
                writer_email: admin_email,
            })
            editNoticeData.post_id = searchResult[0].uuid
            noticeDetailId = searchResult[0].detail_id
            expect(searchResult.length).toEqual(1)
            expect(noticeDetailId).toBeDefined()
            expect(editNoticeData.post_id === "").toEqual(false)
        })
    })

    describe("2, 게시글 조회", () => {
        it("2-1, 주어진 단어를 포함하는 제목을 가진 게시글 조회", async () => {
            const scenario1 = await service.search({
                title: "테스트",
            })
            expect(scenario1.length).toEqual(2)
        })

        it("2-2, 제목과 작성자를 기준을 검색", async () => {
            const scenario2 = await service.search({
                title: "테스트",
                writer_email,
            })
            expect(scenario2.length).toEqual(1)
        })
    
        it("2-3, 최신순으로 나열된 게시글 정렬", async () => {
            const scenario3 = await service.search({
                orderBy: { createdAt: "desc" }
            })
            expect(scenario3.length).toEqual(3)
            expect(scenario3[0].createdAt > scenario3[1].createdAt).toEqual(true)
        })
    
        it("2-4, 인기순으로 나열된 게시글 정렬", async () => {
            // 게시글의 상세를 조회해 조회수를 높입니다
            await service.findDetail(detailIds[0])
    
            const scenario4 = await service.search({
                withBy: "week",
                orderBy: { views: "desc" }
            })
            editData.post_id = scenario4[0].uuid
            editData.writer_email = scenario4[0].writer_email

            expect(scenario4.length).toEqual(3)
            expect(editData.post_id === "").toEqual(false)
            expect(editData.writer_email === "").toEqual(false)
    
            const detail1 = await service.findDetail(scenario4[0].detail_id)
            const detail2 = await service.findDetail(scenario4[1].detail_id)
            expect(detail1.views > detail2.views).toEqual(true)
        })
    })

    describe("3, 게시글 수정", () => {
        it("3-1, 권한이 필요없는 게시글 수정", async () => {
            const result1 = await service.edit(
                editData.post_id,
                editData.writer_email,
                "q-and-a",
                {
                    title: editData.title,
                    contents: editData.contents
                }
            )
            expect(result1).toEqual(true)

            // 수정한 게시글이 반영 되었는지 확인
            const result2 = await service.search({
                title: editData.title,
            })
            expect(result2.length).toEqual(1)

            const [post] = result2
            const result3 = await service.findDetail(post.detail_id)
            expect(post.title).toEqual(editData.title)
            expect(result3).toBeDefined()
            expect(result3.contents).toEqual(editData.contents)
        })

        it("3-2, 권한이 필요한 게시글 수정 시 조건을 충족하지 않는 다면 오류를 반환", async () => {
            try {
                await service.edit(
                    editNoticeData.post_id,
                    writer_email,
                    "notice",
                    {
                        title: editNoticeData.title,
                        contents: editNoticeData.contents,
                    }
                )
            } catch(e) {
                expect(e.status).toEqual(401)
                expect(e.message).toEqual("해당 요청에 필요한 자격 증명에 실패 했습니다.")
            }
        })

        it("3-3, 권한이 필요한 게시글 수정 시 조건을 충족 한다면 정상 작동", async () => {
            const result1 = await service.edit(
                editNoticeData.post_id,
                admin_email,
                "notice",
                {
                    title: editNoticeData.title,
                    contents: editNoticeData.contents
                }
            )
            expect(result1).toEqual(true)

            // 수정한 게시글이 반영 되었는지 확인
            const result2 = await service.search({
                title: editNoticeData.title,
            })
            expect(result2.length).toEqual(1)

            const [notice] = result2
            const result3 = await service.findDetail(noticeDetailId)
            expect(notice.title).toEqual(editNoticeData.title)
            expect(result3).toBeDefined()
            expect(result3.contents).toEqual(editNoticeData.contents)
        })
    })

    describe("4, 게시글 삭제", () => {
        it("4-1, 권한이 필요하지 않는 게시글 삭제", async () => {
            const result1 = await service.delete(
                editData.post_id,
                editData.writer_email,
                "q-and-a",
            )
            expect(result1).toEqual(true)

            // 게시글 삭제 여부 확인
            const result2 = await service.search({
                title: editData.title,
                writer_email: editData.writer_email,
            })
            expect(result2.length).toEqual(0)

            // 게시글 Soft Delete 적용 확인
            const result3 = await prisma.post.findUnique({
                where: { uuid: editData.post_id },
                include: { detail: true }
            })
            expect(result3).not.toEqual(null)
            expect(result3?.detail).not.toEqual(null)
            expect(result3?.deletedAt).not.toEqual(null)
        })

        it("4-2, 권한이 필요한 게시글 삭제 시 조건을 충족하지 않는 다면 오류를 반환", async () => {
            try {
                await service.delete(
                    editNoticeData.post_id,
                    writer_email,
                    "notice",
                )
            } catch(e) {
                expect(e.status).toEqual(401)
                expect(e.message).toEqual("해당 요청에 필요한 자격 증명에 실패 했습니다.")
            }
        })

        it("4-3, 권한이 필요한 게시글 삭제 시 조건을 충족 한다면 정상 작동", async () => {
            const result1 = await service.delete(
                editNoticeData.post_id,
                admin_email,
                "notice",
            )
            expect(result1).toEqual(true)

            // 게시글 삭제 여부 확인
            const result2 = await service.search({
                title: editNoticeData.title,
                writer_email: admin_email,
            })
            expect(result2.length).toEqual(0)

            // 게시글 Soft Delete 적용 확인
            const result3 = await prisma.post.findUnique({
                where: { uuid: editNoticeData.post_id },
                include: { detail: true }
            })
            expect(result3).not.toEqual(null)
            expect(result3?.detail).not.toEqual(null)
            expect(result3?.deletedAt).not.toEqual(null)
        })
    })

    afterAll(async () => {
        await prisma.$disconnect()
    })
})