import { z } from "zod";

export const uploadVehicleDocumentSchema = z.object({
  label: z.string().trim().min(1).max(80),
});
