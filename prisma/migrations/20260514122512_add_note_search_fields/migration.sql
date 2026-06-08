-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('draft', 'active', 'archived');

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "NoteStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
