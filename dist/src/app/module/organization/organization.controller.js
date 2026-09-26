import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { OrganizationService } from "./organization.service";
const createOrganization = catchAsync(async (req, res, next) => {
    const body = req.body;
    const payload = req.file;
    const userId = req.user?.userId;
    console.log("userId", userId);
    if (!payload) {
        throw new Error("No File Provided!");
    }
    const result = await OrganizationService.createOrganization(body, payload?.buffer, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Organization created successfully!",
        data: result
    });
});
const updateLogo = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const payload = req.file;
    const userId = req.user?.userId;
    if (!payload) {
        throw new Error("No File Provided!");
    }
    const result = await OrganizationService.updateLogo(payload?.buffer, userId, organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Organization logo updated successfully!",
        data: result.data
    });
});
const updateOrganizationInfo = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const body = req.body;
    const userId = req.user?.userId;
    const result = await OrganizationService.updateOrganizationInfo(body, userId, organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Organization info updated successfully!",
        data: result
    });
});
const getOrganizationById = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const result = await OrganizationService.getOrganizationById(organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Organization fetched successfully!",
        data: result.data
    });
});
const getAllOrganizations = catchAsync(async (req, res, next) => {
    const query = req.query;
    const result = await OrganizationService.getAllOrganizations(query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Organizations fetched successfully!",
        data: result.data,
        meta: result.meta
    });
});
const deleteOrganization = catchAsync(async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const result = await OrganizationService.deleteOrganization(organizationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Organization deleted successfully!",
        data: result.data
    });
});
export const OrganizationController = {
    createOrganization,
    updateLogo,
    updateOrganizationInfo,
    getOrganizationById,
    getAllOrganizations,
    deleteOrganization
};
