-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "initiatedById" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");
