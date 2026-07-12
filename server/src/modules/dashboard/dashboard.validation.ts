import { z } from "zod";
import { VehicleStatus, VehicleType } from "../../../generated/prisma/enums";

export const kpiQuerySchema = z.object({
  type: z.enum(VehicleType).optional(),
  status: z.enum(VehicleStatus).optional(),
  region: z.string().trim().optional(),
});
