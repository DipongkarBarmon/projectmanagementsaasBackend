import z from "zod"

const sentInvitationZodSchema = z.object({
   body : z.object({
      email: z.string().email({ message: "Invalid email address" }),
      organizationRole: z.string().min(3, { message: "Role must be at least 3 characters long" }),
   })
})

export const InvitationValidation = {
   sentInvitationZodSchema
}