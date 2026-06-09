-- CreateTable
CREATE TABLE "DocumentShare" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "createdById" TEXT,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShare_shortCode_key" ON "DocumentShare"("shortCode");

-- CreateIndex
CREATE INDEX "DocumentShare_shortCode_idx" ON "DocumentShare"("shortCode");

-- CreateIndex
CREATE INDEX "DocumentShare_referenceId_documentType_idx" ON "DocumentShare"("referenceId", "documentType");

-- CreateIndex
CREATE INDEX "DocumentShare_expiresAt_idx" ON "DocumentShare"("expiresAt");
