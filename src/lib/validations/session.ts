import { z } from "zod";

export const createSessionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  durationMinutes: z.coerce.number().int().min(1).max(480),
  place: z.string().min(1, "Place is required").max(500),
  totalSpots: z.coerce.number().int().min(1).max(1000),
  utilities: z.string().optional(),
  description: z.string().optional(),
  level: z.string().optional(),
  tags: z.string().optional(),
  registrationOpen: z.boolean().optional(),
});

export const updateSessionSchema = createSessionSchema.partial().extend({
  registrationOpen: z.boolean().optional(),
  cancel: z.boolean().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
