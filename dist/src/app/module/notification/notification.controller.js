import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";
import httpStatus from "http-status";
const getMyNotifications = catchAsync(async (req, res) => {
    const result = await NotificationService.getMyNotifications(req.params.organizationId, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Notifications retrieved successfully", data: result });
});
const markAsRead = catchAsync(async (req, res) => {
    const result = await NotificationService.markAsRead(req.params.organizationId, req.body.notificationIds, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Notifications marked as read", data: result });
});
const markAllAsRead = catchAsync(async (req, res) => {
    const result = await NotificationService.markAllAsRead(req.params.organizationId, req.user);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "All notifications marked as read", data: result });
});
export const NotificationController = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
