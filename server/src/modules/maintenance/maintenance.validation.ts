import { z } from "zod";
import { MaintenanceStatus } from "../../../generated/prisma/enums";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  cost: z.number().nonnegative().default(0),
  startDate: z.coerce.date().optional(),
});

export const updateMaintenanceSchema = z.object({
  type: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  cost: z.number().nonnegative().optional(),
});

export const listMaintenanceQuerySchema = z.object({
  vehicleId: z.string().optional(),
  status: z.enum(MaintenanceStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
