import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AttachmentService } from "./attachment.service";
import httpStatus from "http-status";

const uploadAttachment = catchAsync(async (req: Request, res: Response) => {
  const result = await AttachmentService.uploadAttachment(req.params.taskId as string, req.body, req.user!, req.params.organizationId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Attachment uploaded successfully", data: result });
});

const getAttachments = catchAsync(async (req: Request, res: Response) => {
  const result = await AttachmentService.getAttachments(req.params.taskId as string, req.user!, req.params.organizationId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Attachments retrieved successfully", data: result });
});

const deleteAttachment = catchAsync(async (req: Request, res: Response) => {
  const result = await AttachmentService.deleteAttachment(req.params.attachmentId as string, req.user!, req.params.organizationId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Attachment deleted successfully", data: result });
});

export const AttachmentController = {
  uploadAttachment,
  getAttachments,
  deleteAttachment
};
