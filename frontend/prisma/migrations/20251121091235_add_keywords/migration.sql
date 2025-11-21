/*
  Warnings:

  - Added the required column `keywords` to the `KnownSample` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keywords` to the `UnknownSample` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KnownSample" ADD COLUMN     "keywords" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UnknownSample" ADD COLUMN     "keywords" TEXT NOT NULL;
