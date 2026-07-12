-- Simplify VehicleType down to the values the product actually uses
-- (BUS/CAR/MOTORCYCLE/TRAILER folded into MINI/TRUCK).
CREATE TYPE "VehicleType_new" AS ENUM ('TRUCK', 'VAN', 'MINI', 'OTHER');

ALTER TABLE "vehicles" ALTER COLUMN "type" TYPE "VehicleType_new" USING (
  CASE "type"::text
    WHEN 'BUS' THEN 'MINI'
    WHEN 'CAR' THEN 'MINI'
    WHEN 'MOTORCYCLE' THEN 'MINI'
    WHEN 'TRAILER' THEN 'TRUCK'
    ELSE "type"::text
  END::"VehicleType_new"
);

DROP TYPE "VehicleType";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";

-- Replace the freeform Vehicle.region string with a fixed Region enum.
CREATE TYPE "Region" AS ENUM ('NORTH', 'EAST', 'SOUTH', 'WEST');

ALTER TABLE "vehicles" ALTER COLUMN "region" TYPE "Region" USING (
  CASE UPPER("region")
    WHEN 'NORTH' THEN 'NORTH'
    WHEN 'EAST' THEN 'EAST'
    WHEN 'SOUTH' THEN 'SOUTH'
    WHEN 'WEST' THEN 'WEST'
    ELSE NULL
  END::"Region"
);

-- Account lockout after 5 failed login attempts (spec section 3.1).
ALTER TABLE "users" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "lockedUntil" TIMESTAMP(3);

-- Vehicle document management (Todo.md).
CREATE TABLE "vehicle_documents" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicle_documents_vehicleId_idx" ON "vehicle_documents"("vehicleId");

ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
