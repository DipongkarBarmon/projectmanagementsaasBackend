import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";


const register = catchAsync(async(req : Request,res : Response , next : NextFunction)=> {
    const body = req.body
    const payload = req.file
    
    if(!payload){
       throw new Error("No File Provided!")
   }

    const result = await AuthService.registerIntoDB(body, payload?.buffer)
    sendResponse(res,{
       success: true,
       statusCode : httpStatus.CREATED,
       message : "User registration completed successfully!",
       data : result
    })
})

export const AuthController = {
   register,
}