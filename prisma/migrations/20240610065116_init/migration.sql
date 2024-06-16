-- CreateTable
CREATE TABLE "user" (
    "uuid" VARCHAR(32) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "pass" VARCHAR(100) NOT NULL,
    "salt" VARCHAR(34) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "post" (
    "uuid" VARCHAR(32) NOT NULL,
    "category" VARCHAR(10) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "post_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "postdetail" (
    "uuid" VARCHAR(32) NOT NULL,
    "contents" TEXT NOT NULL DEFAULT '',
    "post_id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postdetail_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "reply" (
    "uuid" VARCHAR(32) NOT NULL,
    "contents" TEXT NOT NULL DEFAULT '',
    "writer_email" TEXT NOT NULL,
    "detail_id" TEXT NOT NULL,
    "comment_id" TEXT,
    "comment_order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reply_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "postdetail_post_id_key" ON "postdetail"("post_id");

-- AddForeignKey
ALTER TABLE "postdetail" ADD CONSTRAINT "postdetail_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reply" ADD CONSTRAINT "reply_detail_id_fkey" FOREIGN KEY ("detail_id") REFERENCES "postdetail"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
