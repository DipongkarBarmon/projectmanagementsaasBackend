import { Router } from "express";
import { TeamController } from "./team.controller";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationRequest";
import { createTeamSchema, updateTeamSchema, assignTeamLeadSchema, addTeamMemberSchema } from "./team.validation";
import { OrganizationRole } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true });

const ALL_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.PROJECT_MANAGER, OrganizationRole.TEAM_LEAD, OrganizationRole.MEMBER];

router.post("/", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN] }), validationRequest(createTeamSchema), TeamController.createTeam);
router.get("/", auth({ organizationRoles: ALL_ROLES }), TeamController.getAllTeams);
router.get("/:teamId", auth({ organizationRoles: ALL_ROLES }), TeamController.getTeamById);
router.patch("/:teamId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.TEAM_LEAD] }), validationRequest(updateTeamSchema), TeamController.updateTeam);
router.delete("/:teamId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN] }), TeamController.deleteTeam);

router.post("/:teamId/members", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.TEAM_LEAD] }), validationRequest(addTeamMemberSchema), TeamController.addTeamMember);
router.delete("/:teamId/members/:userId", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN, OrganizationRole.TEAM_LEAD] }), TeamController.removeTeamMember);

router.patch("/:teamId/lead", auth({ organizationRoles: [OrganizationRole.ORG_ADMIN] }), validationRequest(assignTeamLeadSchema), TeamController.assignTeamLead);

export const TeamRoutes = router;
