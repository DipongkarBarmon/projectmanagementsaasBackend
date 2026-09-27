import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BillingService } from "./billing.service";
import httpStatus from "http-status";

const getSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await BillingService.getSubscription(req.params.organizationId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Subscription retrieved successfully", data: result });
});

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await BillingService.createSubscription(req.params.organizationId as string, req.body, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Subscription created successfully", data: result });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await BillingService.updateSubscription(req.params.organizationId as string, req.body, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Subscription updated successfully", data: result });
});

export const BillingController = {
  getSubscription,
  createSubscription,
  updateSubscription
};
