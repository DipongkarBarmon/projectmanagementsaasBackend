import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProjectService } from "./project.service";
const createProject = catchAsync(async (req, res, next) => {
    const body = req.body;
    const organizationId = req.params.organizationId;
    const userId = req.user?.userId;
    const result = await ProjectService.createProject(organizationId, userId, body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Project created successfully!",
        data: result
    });
});
const getAllProjects = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const query = req.query;
    const result = await ProjectService.getAllProjects(organizationId, query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Projects fetched successfully!",
        data: result.data,
        meta: result.meta
    });
});
const getProject = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const projectId = req.params.projectId;
    const userId = req.user?.userId;
    const result = await ProjectService.getProject(organizationId, projectId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Project fetched successfully!",
        data: result
    });
});
const updateProject = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const projectId = req.params.projectId;
    const userId = req.user?.userId;
    const body = req.body;
    const result = await ProjectService.updateProject(organizationId, projectId, userId, body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Project updated successfully!",
        data: result
    });
});
const deleteProject = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const projectId = req.params.projectId;
    const userId = req.user?.userId;
    const result = await ProjectService.deleteProject(organizationId, projectId, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Project deleted successfully!",
        data: result
    });
});
const assignProjectManager = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const projectId = req.params.projectId;
    const memberId = req.body.memberId;
    const userId = req.user?.userId;
    console.log("memberId", memberId);
    const result = await ProjectService.assignProjectManager(organizationId, projectId, memberId, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Project manager assigned successfully!",
        data: result
    });
});
const addMember = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const projectId = req.params.projectId;
    const memberId = req.body.memberId;
    const userId = req.user?.userId;
    const result = await ProjectService.addMember(organizationId, projectId, memberId, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Project member added successfully!",
        data: result
    });
});
const removeMember = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const projectId = req.params.projectId;
    const memberId = req.params.userId;
    const userId = req.user?.userId;
    const result = await ProjectService.removeMember(organizationId, projectId, memberId, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Project member removed successfully!",
        data: result
    });
});
export const ProjectController = {
    createProject,
    getAllProjects,
    getProject,
    updateProject,
    deleteProject,
    assignProjectManager,
    addMember,
    removeMember,
};
