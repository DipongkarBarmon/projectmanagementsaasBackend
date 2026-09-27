import { Router } from "express";
import { CommentController } from "./comment.controller";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationRequest";
import { createCommentSchema, updateCommentSchema } from "./comment.validation";
import { OrganizationRole } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true });

const ALL_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER, OrganizationRole.TEAM_LEAD, OrganizationRole.MEMBER];

router.post("/:taskId/comments", auth({ organizationRoles: ALL_ROLES }), validationRequest(createCommentSchema), CommentController.createComment);
router.get("/:taskId/comments", auth({ organizationRoles: ALL_ROLES }), CommentController.getComments);
router.patch("/comments/:commentId", auth({ organizationRoles: ALL_ROLES }), validationRequest(updateCommentSchema), CommentController.updateComment);
router.delete("/comments/:commentId", auth({ organizationRoles: ALL_ROLES }), CommentController.deleteComment);

export const CommentRoutes = router;
