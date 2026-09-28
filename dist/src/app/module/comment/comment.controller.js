import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CommentService } from "./comment.service";
import httpStatus from "http-status";
const createComment = catchAsync(async (req, res) => {
    const result = await CommentService.createComment(req.params.taskId, req.body, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Comment created successfully", data: result });
});
const getComments = catchAsync(async (req, res) => {
    const result = await CommentService.getComments(req.params.taskId, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Comments retrieved successfully", data: result });
});
const updateComment = catchAsync(async (req, res) => {
    const result = await CommentService.updateComment(req.params.commentId, req.body, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Comment updated successfully", data: result });
});
const deleteComment = catchAsync(async (req, res) => {
    const result = await CommentService.deleteComment(req.params.commentId, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Comment deleted successfully", data: result });
});
export const CommentController = {
    createComment,
    getComments,
    updateComment,
    deleteComment
};
