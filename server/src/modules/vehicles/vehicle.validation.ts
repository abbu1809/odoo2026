import { z } from "zod";
import { Region, VehicleStatus, VehicleType } from "../../../generated/prisma/enums";

const VEHICLE_SORT_FIELDS = [
  "registrationNumber",
  "name",
  "odometerKm",
  "acquisitionCost",
  "createdAt",
] as const;

export const createVehicleSchema = z.object({
  registrationNumber: z.string().trim().min(2).max(32),
  name: z.string().trim().min(1).max(120),
  type: z.enum(VehicleType),
  maxLoadCapacityKg: z.number().positive(),
  odometerKm: z.number().nonnegative().default(0),
  acquisitionCost: z.number().nonnegative(),
  region: z.enum(Region).optional(),
  status: z.enum(VehicleStatus).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const listVehiclesQuerySchema = z.object({
  type: z.enum(VehicleType).optional(),
  status: z.enum(VehicleStatus).optional(),
  region: z.enum(Region).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(VEHICLE_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  format: z.enum(["csv"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
