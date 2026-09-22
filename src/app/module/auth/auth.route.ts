import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validationRequest } from "../../middleware/validationRequest";
import { AuthValidation } from "./auth.validation";
import { upload } from "../../lib/multer";

const router = Router()


router.post('/register',upload.single('avatar'),
  validationRequest(AuthValidation.registerZodSchema),
  AuthController.register)

router.post('/login',validationRequest(AuthValidation.loginZodSchema),AuthController.userLogin)

export const AuthRouter = router