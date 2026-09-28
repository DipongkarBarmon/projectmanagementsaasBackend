import { z } from "zod";
export const rejectPaymentSchema = z.object({
    body: z.object({
        failureReason: z.string().min(1, "Failure reason is required"),
    }),
});
