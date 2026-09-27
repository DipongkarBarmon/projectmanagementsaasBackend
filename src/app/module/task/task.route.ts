import { Router } from "express";
import { TaskController } from "./task.controller";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationRequest";
import { createTaskSchema, updateTaskSchema } from "./task.validation";
import { OrganizationRole } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true });

const ALL_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER, OrganizationRole.TEAM_LEAD, OrganizationRole.MEMBER];

router.post("/", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), validationRequest(createTaskSchema), TaskController.createTask);
router.get("/", auth({ organizationRoles: ALL_ROLES }), TaskController.getAllTasks);
router.get("/:taskId", auth({ organizationRoles: ALL_ROLES }), TaskController.getTaskById);
router.patch("/:taskId", auth({ organizationRoles: ALL_ROLES }), validationRequest(updateTaskSchema), TaskController.updateTask);
router.delete("/:taskId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER] }), TaskController.deleteTask);

export const TaskRoutes = router;
