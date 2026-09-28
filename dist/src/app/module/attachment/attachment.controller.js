import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AttachmentService } from "./attachment.service";
import httpStatus from "http-status";
const uploadAttachments = catchAsync(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new Error("Files are required");
    }
    const result = await AttachmentService.uploadAttachments(req.params.taskId, req.files, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Attachments uploaded successfully", data: result });
});
const getAttachments = catchAsync(async (req, res) => {
    const result = await AttachmentService.getAttachments(req.params.taskId, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Attachments retrieved successfully", data: result });
});
const deleteAttachment = catchAsync(async (req, res) => {
    const result = await AttachmentService.deleteAttachment(req.params.attachmentId, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Attachment deleted successfully", data: result });
});
export const AttachmentController = {
    uploadAttachments,
    getAttachments,
    deleteAttachment
};
