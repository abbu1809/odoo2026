import { z } from "zod";

export const createFuelLogSchema = z.object({
  vehicleId: z.string().min(1),
  tripId: z.string().min(1).optional(),
  liters: z.number().positive(),
  cost: z.number().nonnegative(),
  date: z.coerce.date().optional(),
});

export const updateFuelLogSchema = createFuelLogSchema.partial().omit({ vehicleId: true });

export const listFuelLogsQuerySchema = z.object({
  vehicleId: z.string().optional(),
  tripId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
