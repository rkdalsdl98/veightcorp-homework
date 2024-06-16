/*
  Warnings:

  - You are about to drop the column `authority` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "authority";

-- CreateTable
CREATE TABLE "userauthority" (
    "id" SERIAL NOT NULL,
    "authority" VARCHAR(10) NOT NULL,
    "user_uid" VARCHAR(32) NOT NULL,

    CONSTRAINT "userauthority_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userauthority" ADD CONSTRAINT "userauthority_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "user"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
