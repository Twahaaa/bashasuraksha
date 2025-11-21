/*
  Warnings:

  - Added the required column `embedding` to the `UnknownSample` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnknownSample" ADD COLUMN     "embedding" JSONB NOT NULL;
