import { prisma } from "../../lib/prisma";
import { BillingInterval, InvoiceStatus, PaymentMethod, PaymentStatus, SubscriptionStatus, ActivityAction } from "../../../../generated/prisma/enums";
import { ActivityService } from "../activity/activity.service";
import { createBkashPayment } from "../../lib/bkash";
export class OrganizationBillingService {
    static async checkLimit(organizationId, resource) {
        const subscription = await prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true },
        });
        if (!subscription || !subscription.plan) {
            throw new Error("No active subscription found");
        }
        const { plan } = subscription;
        if (resource === "PROJECT") {
            if (plan.maxProjects !== null) {
                const count = await prisma.project.count({
                    where: { organizationId, deletedAt: null },
                });
                if (count >= plan.maxProjects) {
                    throw new Error("your limit finished , upgrade your plan");
                }
            }
        }
        else if (resource === "MEMBER") {
            if (plan.maxMembers !== null) {
                const count = await prisma.organizationMember.count({
                    where: { organizationId },
                });
                if (count >= plan.maxMembers) {
                    throw new Error("Member limit reached for your current plan.");
                }
            }
        }
        else if (resource === "TEAM") {
            if (plan.maxTeams !== null) {
                const count = await prisma.team.count({
                    where: { organizationId },
                });
                if (count >= plan.maxTeams) {
                    throw new Error("Team limit reached for your current plan.");
                }
            }
        }
    }
    static async getBillingOverview(organizationId) {
        const subscription = await prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true },
        });
        return subscription;
    }
    static async getUsage(organizationId) {
        const subscription = await prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true },
        });
        if (!subscription || !subscription.plan) {
            throw new Error("No active subscription found");
        }
        const { plan } = subscription;
        const projects = await prisma.project.count({
            where: { organizationId, deletedAt: null },
        });
        const members = await prisma.organizationMember.count({
            where: { organizationId },
        });
        const teams = await prisma.team.count({
            where: { organizationId },
        });
        return {
            plan: {
                name: plan.name,
                maxProjects: plan.maxProjects,
                maxMembers: plan.maxMembers,
                maxTeams: plan.maxTeams,
            },
            usage: {
                projects,
                members,
                teams,
            },
        };
    }
    static async submitBkashPayment(organizationId, payload, userId) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: payload.invoiceId },
        });
        if (!invoice || invoice.organizationId !== organizationId) {
            throw new Error("Invoice not found");
        }
        if (invoice.status === InvoiceStatus.PAID) {
            throw new Error("Invoice is already paid");
        }
        const existingPayment = await prisma.payment.findUnique({
            where: { transactionId: payload.transactionId },
        });
        if (existingPayment) {
            throw new Error("Transaction ID already exists");
        }
        const payment = await prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                organizationId,
                paymentMethod: PaymentMethod.BKASH,
                amount: invoice.total,
                transactionId: payload.transactionId,
                senderNumber: payload.senderNumber,
                status: PaymentStatus.PENDING,
            },
        });
        await ActivityService.createActivity({
            organizationId,
            actorId: userId,
            action: ActivityAction.PAYMENT_SUBMITTED,
            entityType: "ORGANIZATION",
            entityId: organizationId,
            metadata: { paymentId: payment.id, amount: invoice.total },
            description: `Submitted payment for invoice ${invoice.invoiceNumber}`,
        });
        return payment;
    }
    static async requestUpgrade(organizationId, payload, userId) {
        const newPlan = await prisma.plan.findUnique({ where: { id: payload.planId } });
        if (!newPlan)
            throw new Error("Plan not found");
        const subscription = await prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true },
        });
        if (!subscription)
            throw new Error("Subscription not found");
        const amount = payload.interval === BillingInterval.YEARLY ? newPlan.priceYearly : newPlan.priceMonthly;
        const invoice = await prisma.invoice.create({
            data: {
                organizationId,
                subscriptionId: subscription.id,
                invoiceNumber: `INV-${Date.now()}`,
                subtotal: amount,
                total: amount,
                status: InvoiceStatus.OPEN,
                periodStart: new Date(),
                periodEnd: new Date(new Date().setMonth(new Date().getMonth() + (payload.interval === BillingInterval.YEARLY ? 12 : 1))),
            },
        });
        // Create bKash payment intent
        const bkashPayment = await createBkashPayment(Number(amount), invoice.invoiceNumber);
        await prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                organizationId,
                paymentMethod: PaymentMethod.BKASH,
                amount: amount,
                transactionId: bkashPayment.paymentID,
                status: PaymentStatus.PENDING,
            },
        });
        await ActivityService.createActivity({
            organizationId,
            actorId: userId,
            action: ActivityAction.PLAN_UPGRADED,
            entityType: "ORGANIZATION",
            entityId: organizationId,
            metadata: { newPlan: newPlan.name, paymentID: bkashPayment.paymentID },
            description: `Requested upgrade to ${newPlan.name} via automated bKash`,
        });
        return { invoice, bkashURL: bkashPayment.bkashURL };
    }
    static async requestDowngrade(organizationId, payload, userId) {
        const newPlan = await prisma.plan.findUnique({ where: { id: payload.planId } });
        if (!newPlan)
            throw new Error("Plan not found");
        const subscription = await prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true },
        });
        if (!subscription)
            throw new Error("Subscription not found");
        const amount = payload.interval === BillingInterval.YEARLY ? newPlan.priceYearly : newPlan.priceMonthly;
        const invoice = await prisma.invoice.create({
            data: {
                organizationId,
                subscriptionId: subscription.id,
                invoiceNumber: `INV-${Date.now()}`,
                subtotal: amount,
                total: amount,
                status: InvoiceStatus.OPEN,
                periodStart: new Date(),
                periodEnd: new Date(new Date().setMonth(new Date().getMonth() + (payload.interval === BillingInterval.YEARLY ? 12 : 1))),
            },
        });
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                planId: newPlan.id,
                interval: payload.interval,
                status: SubscriptionStatus.TRIALING,
                currentPeriodStart: invoice.periodStart,
                currentPeriodEnd: invoice.periodEnd,
            },
        });
        await ActivityService.createActivity({
            organizationId,
            actorId: userId,
            action: ActivityAction.PLAN_DOWNGRADED,
            entityType: "ORGANIZATION",
            entityId: organizationId,
            metadata: { newPlan: newPlan.name },
            description: `Requested downgrade to ${newPlan.name}`,
        });
        return invoice;
    }
    static async cancelSubscription(organizationId, userId) {
        const subscription = await prisma.subscription.update({
            where: { organizationId },
            data: { cancelAtPeriodEnd: true },
        });
        await ActivityService.createActivity({
            organizationId,
            actorId: userId,
            action: ActivityAction.SUBSCRIPTION_CANCELLED,
            entityType: "ORGANIZATION",
            entityId: organizationId,
            description: `Cancelled subscription at period end`,
        });
        return subscription;
    }
    static async resumeSubscription(organizationId, userId) {
        const subscription = await prisma.subscription.update({
            where: { organizationId },
            data: { cancelAtPeriodEnd: false },
        });
        await ActivityService.createActivity({
            organizationId,
            actorId: userId,
            action: ActivityAction.SUBSCRIPTION_RESUMED,
            entityType: "ORGANIZATION",
            entityId: organizationId,
            description: `Resumed subscription`,
        });
        return subscription;
    }
    static async getInvoices(organizationId) {
        return prisma.invoice.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } });
    }
    static async getPayments(organizationId) {
        return prisma.payment.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } });
    }
}
