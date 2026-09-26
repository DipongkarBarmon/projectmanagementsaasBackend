import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status"

const sentInvitations = catchAsync(async(req : Request,res : Response , next : NextFunction)=> {
    const body = req.body
    const userId = req.user?.userId
   
     
    sendResponse(res,{
       success: true,
       statusCode : httpStatus.CREATED,
       message : "Invitation sent successfully!",
       data : null
    })
})


export const InvitationController = {
    sentInvitations
}