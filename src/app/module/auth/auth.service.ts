import bcrypt from "bcryptjs"
import { prisma } from "../../lib/prisma"
import { IRegisterPayload } from "./auth.interface"
import config from "../../config"
import { uploadToCloudinary } from "../../lib/cloudinary"



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

    return createUser
   
}

export const AuthService = {
   registerIntoDB
}