-- Rate limiting distribué (serverless / multi-instances)
CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- Clés d'accès région uniques en base
CREATE UNIQUE INDEX "antennes_regionales_accessKey_key" ON "antennes_regionales"("accessKey");
