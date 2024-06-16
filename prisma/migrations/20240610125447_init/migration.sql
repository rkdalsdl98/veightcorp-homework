/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `reply` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reply" DROP COLUMN "deletedAt";
