import { z } from "zod";
import { VehicleStatus, VehicleType } from "../../../generated/prisma/enums";

export const createVehicleSchema = z.object({
  registrationNumber: z.string().trim().min(2).max(32),
  name: z.string().trim().min(1).max(120),
  type: z.enum(VehicleType),
  maxLoadCapacityKg: z.number().positive(),
  odometerKm: z.number().nonnegative().default(0),
  acquisitionCost: z.number().nonnegative(),
  region: z.string().trim().min(1).max(80).optional(),
  status: z.enum(VehicleStatus).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const listVehiclesQuerySchema = z.object({
  type: z.enum(VehicleType).optional(),
  status: z.enum(VehicleStatus).optional(),
  region: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
