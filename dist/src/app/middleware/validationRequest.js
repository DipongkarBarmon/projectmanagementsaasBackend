import { catchAsync } from "../utils/catchAsync";
export const validationRequest = (zodSchema) => {
    return catchAsync(async (req, res, next) => {
        // Enforce fallback objects so Zod never receives raw undefined parameters
        const bodyData = req.body || {};
        const dataToValidate = {
            body: bodyData,
            file: req.file || undefined,
            files: req.files || undefined, // Optional: handle multi-file uploads if using multer
        };
        const result = zodSchema.safeParse(dataToValidate);
        if (!result.success) {
            console.log(result.error.issues);
            throw new Error(result.error.issues[0].message);
        }
        req.body = result.data.body;
        next();
    });
};
