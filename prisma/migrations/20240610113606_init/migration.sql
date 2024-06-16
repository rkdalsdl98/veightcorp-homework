/*
  Warnings:

  - Added the required column `writer_email` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post" ADD COLUMN     "writer_email" TEXT NOT NULL;
