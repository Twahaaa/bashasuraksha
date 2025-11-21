-- CreateTable
CREATE TABLE "KnownSample" (
    "id" SERIAL NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "transcript" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnownSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnknownSample" (
    "id" SERIAL NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "languageGuess" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "transcript" TEXT,
    "clusterId" INTEGER,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnknownSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" SERIAL NOT NULL,
    "centroid" JSONB,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnknownSample" ADD CONSTRAINT "UnknownSample_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
