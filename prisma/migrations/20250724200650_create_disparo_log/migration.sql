-- CreateTable
CREATE TABLE "DisparoLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "instance" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response" JSONB,
    "error" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "userIp" TEXT,
    "module" TEXT,
    "messageBlock" TEXT,
    "campaignId" TEXT,
    "extra" JSONB,

    CONSTRAINT "DisparoLog_pkey" PRIMARY KEY ("id")
);
