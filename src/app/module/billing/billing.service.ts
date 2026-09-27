import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { OrganizationRole } from "../../../../generated/prisma/enums";
import { ICreateSubscriptionPayload, IUpdateSubscriptionPayload } from "./billing.interface";

export class BillingService {
  static async getSubscription(organizationId: string, user: RequestUser) {
    if (user.organizationRole !== OrganizationRole.ORG_ADMIN) {
      throw new Error("Only organization admins can view billing information");
    }

    return await prisma.subscription.findUnique({
      where: { organizationId }
    });
  }

  static async createSubscription(organizationId: string, payload: ICreateSubscriptionPayload, user: RequestUser) {
    if (user.organizationRole !== OrganizationRole.ORG_ADMIN) {
      throw new Error("Only organization admins can manage billing");
    }

    const existing = await prisma.subscription.findUnique({
      where: { organizationId }
    });

    if (existing) {
      throw new Error("Organization already has a subscription");
    }

    return await prisma.subscription.create({
      data: {
        ...payload,
        organizationId,
        currentPeriodEnd: new Date(payload.currentPeriodEnd)
      }
    });
  }

  static async updateSubscription(organizationId: string, payload: IUpdateSubscriptionPayload, user: RequestUser) {
    if (user.organizationRole !== OrganizationRole.ORG_ADMIN) {
      throw new Error("Only organization admins can manage billing");
    }

    const existing = await prisma.subscription.findUnique({
      where: { organizationId }
    });

    if (!existing) {
      throw new Error("Subscription not found");
    }

    const updateData: any = { ...payload };
    if (payload.currentPeriodEnd) {
      updateData.currentPeriodEnd = new Date(payload.currentPeriodEnd);
    }

    return await prisma.subscription.update({
      where: { organizationId },
      data: updateData
    });
  }
}
