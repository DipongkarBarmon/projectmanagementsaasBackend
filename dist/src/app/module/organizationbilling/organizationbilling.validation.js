import { z } from "zod";
import { BillingInterval } from "../../../../generated/prisma/enums";
export const submitPaymentSchema = z.object({
    body: z.object({
        invoiceId: z.string().min(1, "Invoice ID is required"),
        transactionId: z.string().min(1, "Transaction ID is required"),
        senderNumber: z.string().min(1, "Sender Number is required"),
    }),
});
export const upgradePlanSchema = z.object({
    body: z.object({
        planId: z.string().min(1, "Plan ID is required"),
        interval: z.nativeEnum(BillingInterval),
    }),
});
