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
    const {accessToken,refreshToken} = result

    
    res.cookie("accessToken", accessToken, {
       httpOnly:true,
       sameSite :'lax',
       secure : false,
       maxAge : 1000*60*60*24 // 1 day
       
    } )
    
    res.cookie('refreshToken',refreshToken,{
       secure : false,
       httpOnly : true,
       sameSite :'lax',
       maxAge : 1000*60*60*24*7 //7d
    })

    sendResponse(res,{
       success: true,
       statusCode : httpStatus.CREATED,
       message : "User registration completed successfully!",
       data : result
    })
})

const userLogin = catchAsync(async(req : Request,res : Response , next : NextFunction)=> {
    const body = req.body

    const result = await AuthService.userloginFromBD(body)
    
    const {accessToken,refreshToken} = result
    
    res.cookie("accessToken", accessToken, {
       httpOnly:true,
       sameSite :'lax',
       secure : false,
       maxAge : 1000*60*60*24 // 1 day
       
    } )
    
    res.cookie('refreshToken',refreshToken,{
       secure : false,
       httpOnly : true,
       sameSite :'lax',
       maxAge : 1000*60*60*24*7 //7d
    })

    sendResponse(res,{
       success: true,
       statusCode : httpStatus.CREATED,
       message : "User login successfully!",
       data :result
    })
})

export const AuthController = {
   register,
   userLogin
}