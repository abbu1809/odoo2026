import { z } from "zod";
import { Region, VehicleStatus, VehicleType } from "../../../generated/prisma/enums";

export const kpiQuerySchema = z.object({
  type: z.enum(VehicleType).optional(),
  status: z.enum(VehicleStatus).optional(),
  region: z.enum(Region).optional(),
});
