import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ActivityService } from "./activity.service";
import httpStatus from "http-status";
const getOrganizationActivities = catchAsync(async (req, res, next) => {
    const result = await ActivityService.getOrganizationActivities(req.params.organizationId, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Activities retrieved successfully",
        data: result
    });
});
const getEntityActivities = catchAsync(async (req, res, next) => {
    const result = await ActivityService.getEntityActivities(req.params.organizationId, req.params.entityType, req.params.entityId, req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Activities retrieved successfully",
        data: result
    });
});
export const ActivityController = {
    getOrganizationActivities,
    getEntityActivities
};
