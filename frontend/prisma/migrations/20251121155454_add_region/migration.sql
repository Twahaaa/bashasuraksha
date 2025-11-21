/*
  Warnings:

  - You are about to drop the column `lat` on the `KnownSample` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `KnownSample` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `UnknownSample` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `UnknownSample` table. All the data in the column will be lost.
  - Added the required column `region` to the `UnknownSample` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KnownSample" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "UnknownSample" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "region" TEXT NOT NULL;
