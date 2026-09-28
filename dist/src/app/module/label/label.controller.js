import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { LabelService } from "./label.service";
import httpStatus from "http-status";
const createLabel = catchAsync(async (req, res) => {
    const result = await LabelService.createLabel(req.params.organizationId, req.body, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Label created successfully", data: result });
});
const getAllLabels = catchAsync(async (req, res) => {
    const result = await LabelService.getAllLabels(req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Labels retrieved successfully", data: result });
});
const updateLabel = catchAsync(async (req, res) => {
    const result = await LabelService.updateLabel(req.params.organizationId, req.params.labelId, req.body, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Label updated successfully", data: result });
});
const deleteLabel = catchAsync(async (req, res) => {
    const result = await LabelService.deleteLabel(req.params.organizationId, req.params.labelId, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Label deleted successfully", data: result });
});
const assignLabel = catchAsync(async (req, res) => {
    const result = await LabelService.assignLabelToTask(req.params.organizationId, req.params.labelId, req.body, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Label assigned successfully", data: result });
});
const removeLabel = catchAsync(async (req, res) => {
    const result = await LabelService.removeLabelFromTask(req.params.organizationId, req.params.labelId, req.params.taskId, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Label removed successfully", data: result });
});
export const LabelController = {
    createLabel,
    getAllLabels,
    updateLabel,
    deleteLabel,
    assignLabel,
    removeLabel
};
