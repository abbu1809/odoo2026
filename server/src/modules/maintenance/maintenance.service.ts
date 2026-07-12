import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  MaintenanceStatus,
  VehicleStatus,
  type Prisma,
} from "../../../generated/prisma/client";

/**
 * Section 3.6 / 4 - opening a maintenance record automatically switches the
 * vehicle to IN_SHOP, removing it from the driver's/dispatch selection pool.
 */
export async function openMaintenance(
  input: { vehicleId: string; type: string; description?: string; cost: number; startDate?: Date },
  createdById: string,
) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) throw ApiError.notFound("Vehicle not found");
  if (vehicle.status === VehicleStatus.ON_TRIP) {
    throw ApiError.conflict("Cannot open a maintenance record while the vehicle is on a trip");
  }

  const data: Prisma.MaintenanceLogUncheckedCreateInput = {
    vehicleId: input.vehicleId,
    type: input.type,
    cost: input.cost,
    status: MaintenanceStatus.OPEN,
    createdById,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
  };

  const [, log] = await prisma.$transaction([
    prisma.vehicle.update({ where: { id: input.vehicleId }, data: { status: VehicleStatus.IN_SHOP } }),
    prisma.maintenanceLog.create({ data }),
  ]);

  return log;
}

/**
 * Section 4 - closing maintenance restores the vehicle to AVAILABLE unless
 * it has been RETIRED, or another maintenance record is still OPEN.
 */
export async function closeMaintenance(maintenanceId: string) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id: maintenanceId } });
  if (!log) throw ApiError.notFound("Maintenance record not found");
  if (log.status === MaintenanceStatus.CLOSED) {
    throw ApiError.conflict("Maintenance record is already closed");
  }

  const closedLog = await prisma.maintenanceLog.update({
    where: { id: maintenanceId },
    data: { status: MaintenanceStatus.CLOSED, endDate: new Date() },
  });

  const [vehicle, remainingOpenCount] = await Promise.all([
    prisma.vehicle.findUniqueOrThrow({ where: { id: log.vehicleId } }),
    prisma.maintenanceLog.count({
      where: { vehicleId: log.vehicleId, status: MaintenanceStatus.OPEN },
    }),
  ]);

  if (vehicle.status !== VehicleStatus.RETIRED && remainingOpenCount === 0) {
    await prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: VehicleStatus.AVAILABLE } });
  }

  return closedLog;
}
