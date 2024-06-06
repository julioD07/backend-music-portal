/*
  Warnings:

  - You are about to drop the column `mp3File` on the `Song` table. All the data in the column will be lost.
  - Added the required column `filename` to the `Song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `Song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "mp3File",
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;
