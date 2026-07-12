import { prisma } from "../../config/prisma";
import { TripStatus } from "../../../generated/prisma/enums";

export interface VehicleReportRow {
  vehicleId: string;
  registrationNumber: string;
  name: string;
  acquisitionCost: number;
  totalDistanceKm: number;
  totalFuelLiters: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalRevenue: number;
  operationalCost: number;
  /** Distance / Fuel, null when no fuel has been logged yet. */
  fuelEfficiencyKmPerLtr: number | null;
  /** (Revenue - (Maintenance + Fuel)) / Acquisition Cost. */
  roi: number | null;
}

/** Section 3.8 - Reports & Analytics, computed per vehicle. */
export async function getVehicleReports(vehicleId?: string): Promise<VehicleReportRow[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: vehicleId ? { id: vehicleId } : {},
    include: {
      trips: { where: { status: TripStatus.COMPLETED } },
      fuelLogs: true,
      maintenanceLogs: true,
    },
  });

  return vehicles.map((vehicle) => {
    const totalDistanceKm = vehicle.trips.reduce((sum, trip) => sum + (trip.actualDistanceKm ?? 0), 0);
    const totalFuelLiters = vehicle.fuelLogs.reduce((sum, log) => sum + log.liters, 0);
    const totalFuelCost = vehicle.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
    const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((sum, log) => sum + Number(log.cost), 0);
    const totalRevenue = vehicle.trips.reduce((sum, trip) => sum + Number(trip.revenue ?? 0), 0);
    const operationalCost = totalFuelCost + totalMaintenanceCost;
    const acquisitionCost = Number(vehicle.acquisitionCost);

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      acquisitionCost,
      totalDistanceKm: round2(totalDistanceKm),
      totalFuelLiters: round2(totalFuelLiters),
      totalFuelCost: round2(totalFuelCost),
      totalMaintenanceCost: round2(totalMaintenanceCost),
      totalRevenue: round2(totalRevenue),
      operationalCost: round2(operationalCost),
      fuelEfficiencyKmPerLtr: totalFuelLiters > 0 ? round2(totalDistanceKm / totalFuelLiters) : null,
      roi: acquisitionCost > 0 ? round2((totalRevenue - operationalCost) / acquisitionCost) : null,
    };
  });
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
