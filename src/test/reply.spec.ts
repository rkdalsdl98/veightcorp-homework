import { Test, TestingModule } from "@nestjs/testing"
import { PrismaClient } from "@prisma/client"

import RedisModule from "../module/redis.module"
import ReplyModule from "../module/reply.module"
import PostModule from "../module/post.module"
import { ReplyRepository } from "../repository/reply.repository"
import { ReplyService } from "../service/reply.service"
import { PostService } from "../service/post.service"
import { PostRepository } from "../repository/post.repository"

describe("댓글 서비스 유닛 테스트", () => {
    let service: ReplyService
    let postService: PostService
    let repository: ReplyRepository
    let postRepository: PostRepository
    let prisma: PrismaClient

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                PostModule,
                ReplyModule,
                RedisModule,
            ],
            providers: [
                PostService,
                PostRepository,
                ReplyService,
                ReplyRepository,
            ],
        })
        .compile()

        service = module.get<ReplyService>(ReplyService)
        postService = module.get<PostService>(PostService)
        repository = module.get<ReplyRepository>(ReplyRepository)
        postRepository = module.get<PostRepository>(PostRepository)
        prisma = new PrismaClient()
    })

    let detail_id: string = ""

    describe("0, 테스트 환경 확인", () => {
        it("0-1, service, repository, prisma 선언 확인", () => {
            expect(service).toBeDefined()
            expect(postService).toBeDefined()
            expect(repository).toBeDefined()
            expect(postRepository).toBeDefined()
            expect(prisma).toBeDefined()
        })

        it("0-2, 댓글 생성확인을 위한 게시글 상세 ID 수집", async () => {
            const result = await prisma.post.findFirst({
                where: { category: { contains: "q-and-a" }},
                include: { detail: { select: { uuid: true } } }
            })
            expect(result).not.toEqual(null)
            expect(result?.detail).toBeDefined()

            detail_id = result!.detail!.uuid
            expect(detail_id === "").toEqual(false)
        })
    })

    let data = {
        email: "tester@gmail.com",
        pass: "123456",
    }
    let writer_email2 = "tester2@gmail.com"

    let reply1 = {
        contents: "댓글 1 입니다.",
        uid: ""
    }
    let reply2 = {
        contents: "댓글 2 입니다.",
        uid: ""
    }

    let nestedReply1 = {
        contents: "대댓글 1 입니다.",
        uid: "",
        comment_id: "",
    }
    let nestedReply2 = {
        contents: "대댓글 2 입니다.",
        uid: "",
        comment_id: "",
    }

    describe("1, 댓글 생성", () => {
        it("1-1, 일반 댓글 생성", async () => {
            const result1 = await service.write(
                reply1.contents,
                data.email,
                detail_id,
                null,
            )
            const result2 = await service.write(
                reply2.contents,
                writer_email2,
                detail_id,
                null,
            )

            expect(result1).toEqual(true)
            expect(result2).toEqual(true)

            const detail = await postService.findDetail(detail_id)

            for(let i=0; i<2; ++i) {
                if(data.email === detail!.replies[i].writer_email) {
                    reply1.uid = detail!.replies[i].uuid
                    nestedReply1.comment_id = reply1.uid
                }
                else {
                    reply2.uid = detail!.replies[i].uuid
                    nestedReply2.comment_id = reply2.uid
                }
            }

            expect(nestedReply1.comment_id === "").toEqual(false)
            expect(nestedReply2.comment_id === "").toEqual(false)
            expect(detail).not.toEqual(null)
            expect(detail!.replies.length).toEqual(2)
        })

        it("1-2, 대댓글 생성", async () => {
            const result1 = await service.write(
                nestedReply1.contents,
                data.email,
                detail_id,
                nestedReply1.comment_id,
            )
            const result2 = await service.write(
                nestedReply2.contents,
                writer_email2,
                detail_id,
                nestedReply2.comment_id,
            )

            expect(result1).toEqual(true)
            expect(result2).toEqual(true)

            const detail = await postService.findDetail(detail_id)

            let nestedReplyCnt = 0
            const replies = detail!.replies.sort((a, b) => {
                if(!a.comment_id) return 1
                else if(!b.comment_id) return -1

                return 0
            })

            for(let i=0; i<replies.length; ++i) {
                if(replies[i].comment_id) {
                    ++nestedReplyCnt
                    continue
                }
                break
            }

            const nestedReplies = replies.splice(0, nestedReplyCnt)

            for(let i=0; i<nestedReplies.length; ++i) {
                if(nestedReplies[i].writer_email === data.email) nestedReply1.uid = nestedReplies[i].uuid
                else nestedReply2.uid = nestedReplies[i].uuid
            }

            expect(nestedReplies.length).toEqual(2)
            expect(replies.length).toEqual(2)
            expect(nestedReply1.uid === "").toEqual(false)
            expect(nestedReply2.uid === "").toEqual(false)
            expect(nestedReply1.comment_id === reply1.uid).toEqual(true)
            expect(nestedReply2.comment_id === reply2.uid).toEqual(true)
        })
    })

    describe("2, 댓글 수정", () => {
        it("2-1, 일반 댓글 수정", async () => {
            const result1 = await service.edit(
                reply1.uid,
                data.email,
                "수정된 댓글 내용 입니다",
            )

            expect(result1).toEqual(true)

            const detail = await postService.findDetail(detail_id)
            const result2 = detail.replies.find(reply => reply.uuid === reply1.uid)

            expect(result2).toBeDefined()
            expect(result2!.contents === "수정된 댓글 내용 입니다").toEqual(true)
        })

        it("2-2, 대댓글 수정", async () => {
            const result1 = await service.edit(
                nestedReply1.uid,
                data.email,
                "수정된 대댓글 내용 입니다",
            )

            expect(result1).toEqual(true)

            const detail = await postService.findDetail(detail_id)

            let nestedReplyCnt = 0
            const replies = detail!.replies.sort((a, b) => {
                if(!a.comment_id) return 1
                else if(!b.comment_id) return -1

                return 0
            })

            for(let i=0; i<replies.length; ++i) {
                if(replies[i].comment_id) {
                    ++nestedReplyCnt
                    continue
                }
                break
            }

            const nestedReplies = replies.splice(0, nestedReplyCnt)

            const result2 = nestedReplies.find(reply => {
                if(reply.uuid === nestedReply1.uid) return reply
            })

            expect(result2).toBeDefined()
            expect(result2!.comment_id === reply1.uid).toEqual(true)
            expect(result2!.contents === "수정된 대댓글 내용 입니다").toEqual(true)
        })
    })

    describe("3, 댓글 삭제", () => {
        it("3-1, 대댓글 삭제", async () => {
            const result1 = await service.delete(
                nestedReply1.uid,
                data.email
            )

            expect(result1).toEqual(true)

            const detail = await postService.findDetail(detail_id)

            let nestedReplyCnt = 0
            const replies = detail!.replies.sort((a, b) => {
                if(!a.comment_id) return 1
                else if(!b.comment_id) return -1

                return 0
            })

            for(let i=0; i<replies.length; ++i) {
                if(replies[i].comment_id) {
                    ++nestedReplyCnt
                    continue
                }
                break
            }

            const nestedReplies = replies.splice(0, nestedReplyCnt)
            expect(nestedReplies.length).toEqual(1)
        })

        it("3-2, 댓글 삭제" , async () => {
            const result1 = await service.delete(
                reply2.uid,
                writer_email2,
            )

            expect(result1).toEqual(true)

            const detail = await postService.findDetail(detail_id)

            let nestedReplyCnt = 0
            const replies = detail!.replies.sort((a, b) => {
                if(!a.comment_id) return 1
                else if(!b.comment_id) return -1

                return 0
            })

            for(let i=0; i<replies.length; ++i) {
                if(replies[i].comment_id) {
                    ++nestedReplyCnt
                    continue
                }
                break
            }

            const nestedReplies = replies.splice(0, nestedReplyCnt)

            expect(nestedReplies.length).toEqual(1)
            expect(replies.length).toEqual(1)
        })
    })

    afterAll(async () => {
        /** 유저부터 댓글까지 모든 테스트가 종료 되어 사용된 데이터를 삭제 */
        await prisma.post.deleteMany()
        await prisma.reply.deleteMany()
        await prisma.user.delete({ where: { email: data.email }})
        await prisma.$disconnect()
    })
})