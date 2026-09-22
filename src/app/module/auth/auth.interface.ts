

export interface IRegisterPayload {
   name : string,
   email : string,
   password : string,
   avatar? : string,
   avatarPublicId?:string
}

export interface IVerifyEmailPayload {
     email : string,
     otp : string
}

export interface ILoginPayload {
    email : string,
    passowrd: string
}

export interface IForgetPasswordPayload {
     email : string
}

export interface IResetPasswordPayload {
   email : string,
   newPassword: string,
   otp: string
}