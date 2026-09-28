import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminBillingService } from "./adminbilling.service";
import httpStatus from "http-status";
const getPlans = catchAsync(async (req, res) => {
    const result = await AdminBillingService.getPlans();
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Plans retrieved", data: result });
});
const getAllSubscriptions = catchAsync(async (req, res) => {
    const result = await AdminBillingService.getAllSubscriptions();
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Subscriptions retrieved", data: result });
});
const getPendingPayments = catchAsync(async (req, res) => {
    const result = await AdminBillingService.getPendingPayments();
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Pending payments retrieved", data: result });
});
const getPaymentById = catchAsync(async (req, res) => {
    const result = await AdminBillingService.getPaymentById(req.params.paymentId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Payment retrieved", data: result });
});
const approvePayment = catchAsync(async (req, res) => {
    const result = await AdminBillingService.approvePayment(req.params.paymentId, req.user.userId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Payment approved", data: result });
});
const rejectPayment = catchAsync(async (req, res) => {
    const result = await AdminBillingService.rejectPayment(req.params.paymentId, req.user.userId, req.body.failureReason);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Payment rejected", data: result });
});
const bkashCallback = catchAsync(async (req, res) => {
    const { paymentID, status } = req.query;
    const result = await AdminBillingService.executeBkashCallback(paymentID, status);
    // Assuming frontend URL in config
    if (result.success) {
        res.redirect(`http://localhost:3000/payment/success?message=${encodeURIComponent(result.message)}`);
    }
    else {
        res.redirect(`http://localhost:3000/payment/failed?message=${encodeURIComponent(result.message)}`);
    }
});
export const AdminBillingController = {
    getPlans,
    getAllSubscriptions,
    getPendingPayments,
    getPaymentById,
    approvePayment,
    rejectPayment,
    bkashCallback,
};
