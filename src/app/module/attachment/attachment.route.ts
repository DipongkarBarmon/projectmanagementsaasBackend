import { Router } from "express";
import { AttachmentController } from "./attachment.controller";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationRequest";
import { createAttachmentSchema } from "./attachment.validation";
import { OrganizationRole } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true });

const ALL_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER, OrganizationRole.TEAM_LEAD, OrganizationRole.MEMBER];

router.post("/:taskId/attachments", auth({ organizationRoles: ALL_ROLES }), validationRequest(createAttachmentSchema), AttachmentController.uploadAttachment);
router.get("/:taskId/attachments", auth({ organizationRoles: ALL_ROLES }), AttachmentController.getAttachments);
router.delete("/attachments/:attachmentId", auth({ organizationRoles: ALL_ROLES }), AttachmentController.deleteAttachment);

export const AttachmentRoutes = router;
