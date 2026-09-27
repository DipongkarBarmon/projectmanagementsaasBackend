import { Router } from "express";
import { LabelController } from "./label.controller";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationRequest";
import { createLabelSchema, updateLabelSchema, assignLabelSchema } from "./label.validation";
import { OrganizationRole } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true });

const ALL_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER, OrganizationRole.TEAM_LEAD, OrganizationRole.MEMBER];

router.post("/", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), validationRequest(createLabelSchema), LabelController.createLabel);
router.get("/", auth({ organizationRoles: ALL_ROLES }), LabelController.getAllLabels);
router.patch("/:labelId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), validationRequest(updateLabelSchema), LabelController.updateLabel);
router.delete("/:labelId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), LabelController.deleteLabel);

// Assignment routes
router.post("/:labelId/assign", auth({ organizationRoles: ALL_ROLES }), validationRequest(assignLabelSchema), LabelController.assignLabel);
router.delete("/:labelId/tasks/:taskId", auth({ organizationRoles: ALL_ROLES }), LabelController.removeLabel);

export const LabelRoutes = router;
