import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { InvitationService } from "./invitation.service";
const sentInvitations = catchAsync(async (req, res, next) => {
    const body = req.body;
    const userId = req.user?.userId;
    const organizationId = req.params.organizationId;
    const result = await InvitationService.sentInvitations(body, organizationId, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Invitation sent successfully!",
        data: null
    });
});
const getInvitationByToken = catchAsync(async (req, res) => {
    const result = await InvitationService.getInvitationByToken(req.params.token);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Invitation is valid",
        data: result,
    });
});
const acceptInvitation = catchAsync(async (req, res) => {
    const result = await InvitationService.acceptInvitation(req.params.token, req.user?.userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Invitation accepted successfully",
        data: result,
    });
});
export const InvitationController = {
    sentInvitations,
    getInvitationByToken,
    acceptInvitation
};
