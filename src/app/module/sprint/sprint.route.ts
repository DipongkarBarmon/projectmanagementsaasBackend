import { Router } from "express";
import { SprintController } from "./sprint.controller";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationRequest";
import { createSprintSchema, updateSprintSchema } from "./sprint.validation";
import { OrganizationRole } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true });

const ALL_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER, OrganizationRole.TEAM_LEAD, OrganizationRole.MEMBER];

router.post("/", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), validationRequest(createSprintSchema), SprintController.createSprint);
router.get("/", auth({ organizationRoles: ALL_ROLES }), SprintController.getAllSprints);
router.get("/:sprintId", auth({ organizationRoles: ALL_ROLES }), SprintController.getSprintById);
router.patch("/:sprintId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), validationRequest(updateSprintSchema), SprintController.updateSprint);
router.delete("/:sprintId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), SprintController.deleteSprint);

export const SprintRoutes = router;
