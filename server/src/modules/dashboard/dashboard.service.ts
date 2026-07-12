import { prisma } from "../../config/prisma";
import {
  DriverStatus,
  TripStatus,
  VehicleStatus,
  type VehicleType,
} from "../../../generated/prisma/enums";

export interface KpiFilters {
  type?: VehicleType;
  status?: VehicleStatus;
  region?: string;
}

/** Section 3.2 - dashboard KPIs, optionally scoped by vehicle type/status/region. */
export async function getKpis(filters: KpiFilters) {
  const vehicleWhere = {
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.region ? { region: filters.region } : {}),
  };
  const tripWhere = {
    vehicle: vehicleWhere,
  };
  const driverWhere = {
    trips: filters.type || filters.region ? { some: { vehicle: vehicleWhere } } : undefined,
  };

  const [
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    retiredVehicles,
    onTripVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    filteredVehicleCount,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { ...vehicleWhere, status: { not: VehicleStatus.RETIRED } } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: VehicleStatus.AVAILABLE } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: VehicleStatus.IN_SHOP } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: VehicleStatus.RETIRED } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: VehicleStatus.ON_TRIP } }),
    prisma.trip.count({ where: { ...tripWhere, status: TripStatus.DISPATCHED } }),
    prisma.trip.count({ where: { ...tripWhere, status: TripStatus.DRAFT } }),
    prisma.driver.count({ where: { status: DriverStatus.ON_TRIP, ...driverWhere } }),
    filters.status
      ? prisma.vehicle.count({ where: { ...vehicleWhere, status: filters.status } })
      : Promise.resolve(undefined),
  ]);

  const fleetUtilizationPct = activeVehicles === 0 ? 0 : (onTripVehicles / activeVehicles) * 100;

  return {
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilizationPct: Math.round(fleetUtilizationPct * 100) / 100,
    ...(filters.status ? { filteredVehicleCount } : {}),
  };
}
