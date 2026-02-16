import { z } from "zod";

const yearOptions = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Other"] as const;

export const registerSchema = z.object({
  sessionId: z.string().min(1, "Session is required"),
  name: z.string().min(1, "Name is required").max(200),
  surname: z.string().min(1, "Surname is required").max(200),
  year: z.enum(yearOptions),
  group: z.string().min(1, "Group is required").max(200),
  university: z.string().min(1, "University is required").max(200),
  email: z.string().email("Invalid email"),
  hasCodingExperience: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const resendConfirmationSchema = z.object({
  sessionId: z.string().min(1),
  email: z.string().email(),
});

export const confirmQuerySchema = z.object({
  token: z.string().min(1),
});

export { yearOptions };
