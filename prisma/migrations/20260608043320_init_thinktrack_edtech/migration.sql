/*
  Warnings:

  - You are about to drop the column `activeProvider` on the `AISettings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `AISettings` table. All the data in the column will be lost.
  - You are about to drop the column `geminiApiKey` on the `AISettings` table. All the data in the column will be lost.
  - You are about to drop the column `grokApiKey` on the `AISettings` table. All the data in the column will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CognitiveMode" AS ENUM ('ANAK', 'REMAJA', 'DEWASA');

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- AlterTable
ALTER TABLE "AISettings" DROP COLUMN "activeProvider",
DROP COLUMN "createdAt",
DROP COLUMN "geminiApiKey",
DROP COLUMN "grokApiKey",
ADD COLUMN     "anthropicApiKey" TEXT,
ALTER COLUMN "activeModel" SET DEFAULT 'claude-3-sonnet';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cognitiveMode" "CognitiveMode" NOT NULL DEFAULT 'REMAJA';

-- DropTable
DROP TABLE "Note";

-- DropEnum
DROP TYPE "NoteStatus";

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThinkingTrace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "inputMethod" TEXT NOT NULL,
    "stepData" JSONB NOT NULL,
    "misconceptions" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThinkingTrace_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThinkingTrace" ADD CONSTRAINT "ThinkingTrace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThinkingTrace" ADD CONSTRAINT "ThinkingTrace_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
