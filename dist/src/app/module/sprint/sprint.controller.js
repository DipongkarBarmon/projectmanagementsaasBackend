import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { SprintService } from "./sprint.service";
const createSprint = catchAsync(async (req, res) => {
    const result = await SprintService.createSprint(req.params.projectId, req.body, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Sprint created successfully",
        data: result
    });
});
const getAllSprints = catchAsync(async (req, res) => {
    const result = await SprintService.getAllSprints(req.params.projectId, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Sprints retrieved successfully",
        data: result
    });
});
const getSprintById = catchAsync(async (req, res) => {
    const result = await SprintService.getSrintById(req.params.projectId, req.params.sprintId, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Sprint retrieved successfully",
        data: result
    });
});
const updateSprint = catchAsync(async (req, res) => {
    const result = await SprintService.updateSprint(req.params.projectId, req.params.sprintId, req.body, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Sprint updated successfully",
        data: result
    });
});
const deleteSprint = catchAsync(async (req, res) => {
    const result = await SprintService.deleteSprint(req.params.projectId, req.params.sprintId, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Sprint deleted successfully",
        data: result
    });
});
export const SprintController = {
    createSprint,
    getAllSprints,
    getSprintById,
    updateSprint,
    deleteSprint
};
