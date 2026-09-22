import bcrypt from "bcryptjs"
import { prisma } from "../../lib/prisma"
import { ILoginPayload, IRegisterPayload } from "./auth.interface"
import config from "../../config"
import { uploadToCloudinary } from "../../lib/cloudinary"
import { jwtUtiles } from "../../utils/jwt"
import { SignOptions } from "jsonwebtoken"
import crypto from 'crypto'
import { redisClient } from "../../lib/redis"




const registerIntoDB = async(payload : IRegisterPayload,fileBuffer : Buffer) => {
    const {name, password} = payload
    const email = payload.email.trim().toLowerCase()
    if(!email || !password) {
       throw new Error("Email and Password must be provided!")
    }

    const existingUser = await prisma.user.findFirst({
       where : {
          email  
       }
    })
    
    if(existingUser) {
       throw new Error("All ready exist user with this email")
    }
   //  console.log("the salt is " ,config.bcrypt_salt_rounds)
    const hashedPasword = await bcrypt.hash(password,Number(config.bcrypt_salt_rounds))

    
    let cloudinaryResult;

    try {
        cloudinaryResult = await uploadToCloudinary(fileBuffer, 'user-avatars');
    } catch (uploadError) {
        throw new Error("Failed to upload avatar image to Cloudinary.");
    }

   if (!cloudinaryResult || !cloudinaryResult.secure_url) {
        throw new Error("Avatar upload completed but secure URL was not generated.");
    }


    const otpKey = `register-otp:${email}`
    const otp =crypto.randomInt(100000,1000000).toString()

    const expiration = 60 *5
    await redisClient.set(otpKey,otp, {
       expiration : {
         "type" : "EX",
         "value" :expiration
       }
    })

    const registerPayloadKey =  `register-data :${email}`
    const registerPayload = {
       name,
       email,
       password :hashedPasword,
       avatar : cloudinaryResult.secure_url,
       avatarPublicId : cloudinaryResult.public_id
    }

    
    await redisClient.set(registerPayloadKey,JSON.stringify(registerPayload), {
        expiration:{
            "type" :"EX",
            "value":expiration
        }
    })

    
    
    const createUser = await prisma.user.create({
        data : {
          name,
          email,
          password : hashedPasword,
          avatar : cloudinaryResult.secure_url,
          avatarPublicId : cloudinaryResult.public_id
        },
        omit : {
          password : true
        }
    })

    
    if(!createUser) {
       throw new Error("User create fail!")
    }


    const jwtPayload = {
       userId : createUser.id,
       neme :  createUser.name,
       email : createUser.email,
       role : createUser.platformRole
    }

    const accessToken = jwtUtiles.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expiration as SignOptions
    )

    const refreshToken = jwtUtiles.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expiration as SignOptions
    )

    return {
      accessToken,
      refreshToken,
      createUser,
   }
   
}
 
const userloginFromBD = async(payload : ILoginPayload) => {
    const passowrd = payload.passowrd
    const email = payload.email.trim().toLowerCase()
    
    const user = await prisma.user.findFirst({
      where :{email}
    })

    if(!user) {
       throw new Error("User in not found!")
    }

    if(user.status === 'BLOCKED') {
       throw new Error("User is Blocked!")
    }

    if(user.status === 'DELETED' || user.isDeleted === true) {
       throw new Error("User Id is deleted")
    }

    const isPasswordMatched = bcrypt.compare(passowrd,user.password as string)

    if(!isPasswordMatched) {
       throw new Error("Invalid credentials")
    }

    const jwtPayload = {
       userId : user.id,
       neme :  user.name,
       email : user.email,
       role : user.platformRole
    }

    const accessToken = jwtUtiles.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expiration as SignOptions
    )

    const refreshToken = jwtUtiles.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expiration as SignOptions
    )

    return {
      accessToken,
      refreshToken,    
   }


}

export const AuthService = {
   registerIntoDB,
   userloginFromBD
}