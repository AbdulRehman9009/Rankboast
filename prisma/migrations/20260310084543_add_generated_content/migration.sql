-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "keywordsUsed" TEXT[],
    "tone" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "seoTitle" VARCHAR(255) NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "articleBody" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
