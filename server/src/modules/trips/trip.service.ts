import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  DriverStatus,
  TripStatus,
  VehicleStatus,
  type Driver,
  type Vehicle,
} from "../../../generated/prisma/client";
import type { CreateTripInput, CompleteTripInput } from "./trip.types";

/**
 * Section 4 - Mandatory Business Rules. Re-run both at trip creation
 * (selecting an "available vehicle"/"available driver") and again at
 * dispatch time in case state drifted while the trip sat in Draft.
 */
function assertAssignmentIsValid(vehicle: Vehicle, driver: Driver, cargoWeightKg: number) {
  if (vehicle.status !== VehicleStatus.AVAILABLE) {
    throw ApiError.conflict(
      `Vehicle ${vehicle.registrationNumber} is not available (status: ${vehicle.status})`,
    );
  }

  if (driver.status !== DriverStatus.AVAILABLE) {
    throw ApiError.conflict(`Driver ${driver.name} is not available (status: ${driver.status})`);
  }

  if (driver.licenseExpiryDate.getTime() < Date.now()) {
    throw ApiError.conflict(`Driver ${driver.name}'s license expired on ${driver.licenseExpiryDate.toISOString().slice(0, 10)}`);
  }

  if (cargoWeightKg > vehicle.maxLoadCapacityKg) {
    throw ApiError.badRequest(
      `Cargo weight (${cargoWeightKg}kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacityKg}kg)`,
    );
  }
}

async function loadVehicleAndDriver(vehicleId: string, driverId: string) {
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
  ]);
  if (!vehicle) throw ApiError.notFound("Vehicle not found");
  if (!driver) throw ApiError.notFound("Driver not found");
  return { vehicle, driver };
}

export async function createTrip(input: CreateTripInput, createdById: string) {
  const { vehicle, driver } = await loadVehicleAndDriver(input.vehicleId, input.driverId);
  assertAssignmentIsValid(vehicle, driver, input.cargoWeightKg);

  return prisma.trip.create({
    data: {
      source: input.source,
      destination: input.destination,
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      cargoWeightKg: input.cargoWeightKg,
      plannedDistanceKm: input.plannedDistanceKm,
      status: TripStatus.DRAFT,
      createdById,
    },
  });
}

export async function dispatchTrip(tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw ApiError.notFound("Trip not found");
  if (trip.status !== TripStatus.DRAFT) {
    throw ApiError.conflict(`Only DRAFT trips can be dispatched (current status: ${trip.status})`);
  }

  const { vehicle, driver } = await loadVehicleAndDriver(trip.vehicleId, trip.driverId);
  assertAssignmentIsValid(vehicle, driver, trip.cargoWeightKg);

  const [, , updatedTrip] = await prisma.$transaction([
    prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: VehicleStatus.ON_TRIP } }),
    prisma.driver.update({ where: { id: driver.id }, data: { status: DriverStatus.ON_TRIP } }),
    prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.DISPATCHED,
        dispatchedAt: new Date(),
        startOdometerKm: vehicle.odometerKm,
      },
    }),
  ]);

  return updatedTrip;
}

export async function completeTrip(tripId: string, input: CompleteTripInput) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw ApiError.notFound("Trip not found");
  if (trip.status !== TripStatus.DISPATCHED) {
    throw ApiError.conflict(`Only DISPATCHED trips can be completed (current status: ${trip.status})`);
  }

  const startOdometerKm = trip.startOdometerKm ?? 0;
  if (input.finalOdometerKm < startOdometerKm) {
    throw ApiError.badRequest("finalOdometerKm cannot be less than the odometer reading at dispatch");
  }
  const actualDistanceKm = input.finalOdometerKm - startOdometerKm;

  const [, , updatedTrip] = await prisma.$transaction([
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: VehicleStatus.AVAILABLE, odometerKm: input.finalOdometerKm },
    }),
    prisma.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.AVAILABLE } }),
    prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        completedAt: new Date(),
        finalOdometerKm: input.finalOdometerKm,
        fuelConsumedLtr: input.fuelConsumedLtr,
        actualDistanceKm,
        ...(input.revenue !== undefined ? { revenue: input.revenue } : {}),
      },
    }),
  ]);

  return updatedTrip;
}

export async function cancelTrip(tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw ApiError.notFound("Trip not found");
  if (trip.status !== TripStatus.DRAFT && trip.status !== TripStatus.DISPATCHED) {
    throw ApiError.conflict(`Cannot cancel a trip with status ${trip.status}`);
  }

  const wasDispatched = trip.status === TripStatus.DISPATCHED;

  const [, , updatedTrip] = await prisma.$transaction([
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: wasDispatched ? { status: VehicleStatus.AVAILABLE } : {},
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: wasDispatched ? { status: DriverStatus.AVAILABLE } : {},
    }),
    prisma.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.CANCELLED, cancelledAt: new Date() },
    }),
  ]);

  return updatedTrip;
}
