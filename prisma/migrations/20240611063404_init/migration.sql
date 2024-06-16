/*
  Warnings:

  - The primary key for the `reply` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `reply` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reply" DROP CONSTRAINT "reply_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "reply_pkey" PRIMARY KEY ("id");
