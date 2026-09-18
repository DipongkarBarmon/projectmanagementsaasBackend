import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validationRequest } from "../../middleware/validationRequest";
import { authValidation } from "./auth.validation";
import { upload } from "../../lib/multer";

const router = Router()


router.post('/register',upload.single('avatar'),
  validationRequest(authValidation.registerZodSchema),
  AuthController.register)

export const AuthRouter = router