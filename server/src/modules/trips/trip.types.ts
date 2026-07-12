import type { z } from "zod";
import type { createTripSchema, completeTripSchema, updateTripSchema } from "./trip.validation";

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
