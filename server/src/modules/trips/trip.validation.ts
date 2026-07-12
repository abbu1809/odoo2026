import { z } from "zod";
import { TripStatus } from "../../../generated/prisma/enums";

export const createTripSchema = z.object({
  source: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistanceKm: z.number().positive(),
});

export const updateTripSchema = z.object({
  source: z.string().trim().min(1).max(120).optional(),
  destination: z.string().trim().min(1).max(120).optional(),
  vehicleId: z.string().min(1).optional(),
  driverId: z.string().min(1).optional(),
  cargoWeightKg: z.number().positive().optional(),
  plannedDistanceKm: z.number().positive().optional(),
});

export const completeTripSchema = z.object({
  finalOdometerKm: z.number().nonnegative(),
  fuelConsumedLtr: z.number().nonnegative(),
  revenue: z.number().nonnegative().optional(),
});

const TRIP_SORT_FIELDS = ["source", "destination", "cargoWeightKg", "plannedDistanceKm", "createdAt"] as const;

export const listTripsQuerySchema = z.object({
  status: z.enum(TripStatus).optional(),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  sortBy: z.enum(TRIP_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  format: z.enum(["csv"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
