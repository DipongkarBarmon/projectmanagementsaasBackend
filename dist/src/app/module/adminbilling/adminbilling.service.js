import { prisma } from "../../lib/prisma";
import { InvoiceStatus, PaymentStatus, SubscriptionStatus, ActivityAction } from "../../../../generated/prisma/enums";
import { ActivityService } from "../activity/activity.service";
import { executeBkashPayment } from "../../lib/bkash";
export class AdminBillingService {
    static async getPlans() {
        return prisma.plan.findMany();
    }
    static async getAllSubscriptions() {
        return prisma.subscription.findMany({ include: { plan: true, organization: true } });
    }
    static async getPendingPayments() {
        return prisma.payment.findMany({ where: { status: PaymentStatus.PENDING }, include: { invoice: true, organization: true } });
    }
    static async getPaymentById(paymentId) {
        return prisma.payment.findUnique({ where: { id: paymentId }, include: { invoice: true, organization: true } });
    }
    static async approvePayment(paymentId, adminId) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: true },
        });
        if (!payment)
            throw new Error("Payment not found");
        if (payment.status !== PaymentStatus.PENDING)
            throw new Error("Payment is not pending");
        const invoice = payment.invoice;
        const subscription = await prisma.subscription.findUnique({
            where: { id: invoice.subscriptionId },
            include: { plan: true },
        });
        if (!subscription)
            throw new Error("Subscription not found");
        const result = await prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: PaymentStatus.SUCCESS,
                    verifiedAt: new Date(),
                    verifiedById: adminId,
                },
            });
            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: InvoiceStatus.PAID },
            });
            const updatedSubscription = await tx.subscription.update({
                where: { id: subscription.id },
                data: { status: SubscriptionStatus.ACTIVE },
            });
            return { updatedPayment, updatedSubscription };
        });
        await ActivityService.createActivity({
            organizationId: payment.organizationId,
            actorId: adminId,
            action: ActivityAction.PAYMENT_APPROVED,
            entityType: "ORGANIZATION",
            entityId: payment.organizationId,
            metadata: { paymentId: payment.id },
            description: `Payment approved by admin`,
        });
        return result;
    }
    static async rejectPayment(paymentId, adminId, failureReason) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment)
            throw new Error("Payment not found");
        if (payment.status !== PaymentStatus.PENDING)
            throw new Error("Payment is not pending");
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: PaymentStatus.FAILED,
                failureReason,
                verifiedAt: new Date(),
                verifiedById: adminId,
            },
        });
        await ActivityService.createActivity({
            organizationId: payment.organizationId,
            actorId: adminId,
            action: ActivityAction.PAYMENT_REJECTED,
            entityType: "ORGANIZATION",
            entityId: payment.organizationId,
            metadata: { paymentId: payment.id, reason: failureReason },
            description: `Payment rejected by admin`,
        });
        return updatedPayment;
    }
    static async executeBkashCallback(paymentID, status) {
        if (status === 'cancel' || status === 'failure') {
            await prisma.payment.updateMany({
                where: { transactionId: paymentID },
                data: { status: PaymentStatus.FAILED, failureReason: "User cancelled or failed" }
            });
            return { success: false, message: "Payment cancelled or failed" };
        }
        if (status === 'success') {
            const executeResult = await executeBkashPayment(paymentID);
            const payment = await prisma.payment.findUnique({
                where: { transactionId: paymentID },
                include: { invoice: true }
            });
            if (!payment)
                throw new Error("Payment not found for transaction: " + paymentID);
            const invoice = payment.invoice;
            const subscription = await prisma.subscription.findUnique({
                where: { id: invoice.subscriptionId }
            });
            if (!subscription)
                throw new Error("Subscription not found");
            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: PaymentStatus.SUCCESS, verifiedAt: new Date(), transactionId: executeResult.trxID }
                });
                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: { status: InvoiceStatus.PAID }
                });
                await tx.subscription.update({
                    where: { id: subscription.id },
                    data: { status: SubscriptionStatus.ACTIVE }
                });
            });
            return { success: true, message: "Payment successful" };
        }
        return { success: false, message: "Unknown status" };
    }
}
