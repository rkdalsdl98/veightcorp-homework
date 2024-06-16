/*
  Warnings:

  - The `comment_id` column on the `reply` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "reply" DROP COLUMN "comment_id",
ADD COLUMN     "comment_id" INTEGER;
