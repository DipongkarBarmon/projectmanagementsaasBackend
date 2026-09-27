import { z } from "zod";
import { SubscriptionStatus, BillingInterval } from "../../../../generated/prisma/enums";

export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().min(1),
    status: z.nativeEnum(SubscriptionStatus).optional(),
    interval: z.nativeEnum(BillingInterval).optional(),
    currentPeriodEnd: z.string().datetime(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().min(1).optional(),
    status: z.nativeEnum(SubscriptionStatus).optional(),
    interval: z.nativeEnum(BillingInterval).optional(),
    currentPeriodEnd: z.string().datetime().optional(),
  }),
});
