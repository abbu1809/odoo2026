import { z } from "zod";
import { DriverStatus } from "../../../generated/prisma/enums";

export const createDriverSchema = z.object({
  name: z.string().trim().min(2).max(120),
  licenseNumber: z.string().trim().min(2).max(40),
  licenseCategory: z.string().trim().min(1).max(20),
  licenseExpiryDate: z.coerce.date(),
  contactNumber: z.string().trim().min(5).max(20),
  safetyScore: z.number().min(0).max(100).default(100),
  status: z.enum(DriverStatus).optional(),
  userId: z.string().min(1).optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

const DRIVER_SORT_FIELDS = ["name", "licenseExpiryDate", "safetyScore", "createdAt"] as const;

export const listDriversQuerySchema = z.object({
  status: z.enum(DriverStatus).optional(),
  search: z.string().trim().optional(),
  expiringWithinDays: z.coerce.number().int().min(0).optional(),
  sortBy: z.enum(DRIVER_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  format: z.enum(["csv"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
