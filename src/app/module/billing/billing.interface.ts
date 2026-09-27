import { SubscriptionStatus, BillingInterval } from "../../../../generated/prisma/enums";

export interface ICreateSubscriptionPayload {
  planId: string;
  status?: SubscriptionStatus;
  interval?: BillingInterval;
  currentPeriodEnd: string;
}

export interface IUpdateSubscriptionPayload {
  planId?: string;
  status?: SubscriptionStatus;
  interval?: BillingInterval;
  currentPeriodEnd?: string;
}
