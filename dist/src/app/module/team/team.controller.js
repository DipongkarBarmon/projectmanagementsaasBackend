import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TeamService } from "./team.service";
import httpStatus from "http-status";
const createTeam = catchAsync(async (req, res, next) => {
    const result = await TeamService.createTeam(req.body, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Team created successfully",
        data: result
    });
});
const getAllTeams = catchAsync(async (req, res, next) => {
    const query = req.query;
    const result = await TeamService.getAllTeams(query, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Teams retrieved successfully",
        data: result
    });
});
const getTeamById = catchAsync(async (req, res, next) => {
    const result = await TeamService.getTeamById(req.params.teamId, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team retrieved successfully",
        data: result
    });
});
const updateTeam = catchAsync(async (req, res, next) => {
    const result = await TeamService.updateTeam(req.params.teamId, req.body, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team updated successfully",
        data: result
    });
});
const deleteTeam = catchAsync(async (req, res, next) => {
    const result = await TeamService.deleteTeam(req.params.teamId, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team deleted successfully",
        data: result
    });
});
const addTeamMember = catchAsync(async (req, res, next) => {
    const result = await TeamService.addTeamMember(req.params.teamId, req.body, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Member added successfully",
        data: result
    });
});
const removeTeamMember = catchAsync(async (req, res, next) => {
    const result = await TeamService.removeTeamMember(req.params.teamId, req.params.userId, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Member removed successfully",
        data: result
    });
});
const assignTeamLead = catchAsync(async (req, res, next) => {
    const result = await TeamService.assignTeamLead(req.params.teamId, req.body, req.user, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team lead assigned successfully",
        data: result
    });
});
const viewTeamMembers = catchAsync(async (req, res, next) => {
    const result = await TeamService.viewTeamMembers(req.params.teamId, req.params.organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team members retrieved successfully",
        data: result
    });
});
export const TeamController = {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    assignTeamLead,
    viewTeamMembers
};
