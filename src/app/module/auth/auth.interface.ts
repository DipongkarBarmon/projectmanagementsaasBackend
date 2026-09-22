

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