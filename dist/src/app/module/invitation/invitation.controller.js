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
        data: result
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
const getAllInvitations = catchAsync(async (req, res) => {
    const query = req.query;
    const result = await InvitationService.getAllInvitations(query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All invitations fetched successfully",
        data: result,
    });
});
const getInvitationById = catchAsync(async (req, res) => {
    const invitationId = req.params.invitationId;
    const result = await InvitationService.getInvitationById(invitationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Invitation fetched successfully",
        data: result,
    });
});
const cencelInvitation = catchAsync(async (req, res) => {
    const invitationId = req.params.invitationId;
    const result = await InvitationService.cencelInvitation(invitationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Invitation cancelled successfully",
        data: result,
    });
});
const deleteInvitation = catchAsync(async (req, res) => {
    const invitationId = req.params.invitationId;
    const result = await InvitationService.deleteInvitation(invitationId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Invitation deleted successfully",
        data: result,
    });
});
export const InvitationController = {
    sentInvitations,
    getInvitationByToken,
    acceptInvitation,
    getAllInvitations,
    getInvitationById,
    cencelInvitation,
    deleteInvitation
};
