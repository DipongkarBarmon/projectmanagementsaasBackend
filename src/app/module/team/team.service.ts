import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { OrganizationRole, ActivityAction } from "../../../../generated/prisma/enums";
import { ActivityService } from "../activity/activity.service";
import { ICreateTeamPayload, IUpdateTeamPayload, IAssignTeamLeadPayload, IAddTeamMemberPayload } from "./team.interface";

export class TeamService {
  static async createTeam(payload: ICreateTeamPayload, user: RequestUser, organizationId: string) {
    if (user.organizationRole !== OrganizationRole.ORG_ADMIN) {
      throw new Error("Only organization admins can create teams.");
    }

    const team = await prisma.team.create({
      data: {
        ...payload,
        organizationId,
        createdById: user.userId,
      },
    });

    await ActivityService.createActivity({
      organizationId,
      actorId: user.userId,
      action: ActivityAction.CREATED,
      entityType: "TEAM",
      entityId: team.id,
      description: `Team ${team.name} created`,
    });

    return team;
  }

  static async getAllTeams(user: RequestUser, organizationId: string) {
    const isManagerOrAdmin = 
      user.organizationRole === OrganizationRole.ORG_ADMIN || 
      user.organizationRole === OrganizationRole.PROJECT_MANAGER;

    if (isManagerOrAdmin) {
      return await prisma.team.findMany({
        where: { organizationId },
        include: {
          teamLead: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true } }
        }
      });
    }

    // For TEAM_LEAD and MEMBER, return only teams they are a part of
    return await prisma.team.findMany({
      where: {
        organizationId,
        members: {
          some: { userId: user.userId }
        }
      },
      include: {
        teamLead: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } }
      }
    });
  }

  static async getTeamById(teamId: string, user: RequestUser, organizationId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId, organizationId },
      include: {
        teamLead: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!team) {
      throw new Error("Team not found");
    }

    const isManagerOrAdmin = 
      user.organizationRole === OrganizationRole.ORG_ADMIN || 
      user.organizationRole === OrganizationRole.PROJECT_MANAGER;

    if (!isManagerOrAdmin) {
      const isMember = team.members.some(m => m.userId === user.userId);
      if (!isMember) {
        throw new Error("You don't have permission to view this team");
      }
    }

    return team;
  }

  static async updateTeam(teamId: string, payload: IUpdateTeamPayload, user: RequestUser, organizationId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId, organizationId }
    });

    if (!team) {
      throw new Error("Team not found");
    }

    const isOrgAdmin = user.organizationRole === OrganizationRole.ORG_ADMIN;
    const isTeamLead = user.organizationRole === OrganizationRole.TEAM_LEAD && team.teamLeadId === user.userId;

    if (!isOrgAdmin && !isTeamLead) {
      throw new Error("You don't have permission to update this team");
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: payload
    });

    await ActivityService.createActivity({
      organizationId,
      actorId: user.userId,
      action: ActivityAction.UPDATED,
      entityType: "TEAM",
      entityId: team.id,
      description: `Team updated`,
    });

    return updatedTeam;
  }

  static async deleteTeam(teamId: string, user: RequestUser, organizationId: string) {
    if (user.organizationRole !== OrganizationRole.ORG_ADMIN) {
      throw new Error("Only organization admins can delete teams.");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId, organizationId }
    });

    if (!team) throw new Error("Team not found");

    await prisma.team.delete({
      where: { id: teamId }
    });

    await ActivityService.createActivity({
      organizationId,
      actorId: user.userId,
      action: ActivityAction.DELETED,
      entityType: "TEAM",
      entityId: teamId,
      description: `Team ${team.name} deleted`,
    });

    return team;
  }

  static async addTeamMember(teamId: string, payload: IAddTeamMemberPayload, user: RequestUser, organizationId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId, organizationId }
    });

    if (!team) throw new Error("Team not found");

    const isOrgAdmin = user.organizationRole === OrganizationRole.ORG_ADMIN;
    const isTeamLead = user.organizationRole === OrganizationRole.TEAM_LEAD && team.teamLeadId === user.userId;

    if (!isOrgAdmin && !isTeamLead) {
      throw new Error("You don't have permission to add members to this team");
    }

    // Verify target user is in the organization
    const orgMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: payload.userId
        }
      }
    });

    if (!orgMember) {
      throw new Error("User is not a member of this organization");
    }

    // Check if already in team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: payload.userId
        }
      }
    });

    if (existingMember) {
      throw new Error("User is already a member of this team");
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: payload.userId
      }
    });

    await ActivityService.createActivity({
      organizationId,
      actorId: user.userId,
      action: ActivityAction.MEMBER_ADDED,
      entityType: "TEAM",
      entityId: team.id,
      metadata: { targetUserId: payload.userId },
      description: `Added a new member to team`,
    });

    return teamMember;
  }

  static async removeTeamMember(teamId: string, targetUserId: string, user: RequestUser, organizationId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId, organizationId }
    });

    if (!team) throw new Error("Team not found");

    const isOrgAdmin = user.organizationRole === OrganizationRole.ORG_ADMIN;
    const isTeamLead = user.organizationRole === OrganizationRole.TEAM_LEAD && team.teamLeadId === user.userId;

    if (!isOrgAdmin && !isTeamLead) {
      throw new Error("You don't have permission to remove members from this team");
    }

    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId
        }
      }
    });

    if (!existingMember) {
      throw new Error("User is not a member of this team");
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId
        }
      }
    });

    await ActivityService.createActivity({
      organizationId,
      actorId: user.userId,
      action: ActivityAction.MEMBER_REMOVED,
      entityType: "TEAM",
      entityId: team.id,
      metadata: { targetUserId },
      description: `Removed a member from team`,
    });

    // If removing the team lead, unset the lead
    if (team.teamLeadId === targetUserId) {
      await prisma.team.update({
        where: { id: teamId },
        data: { teamLeadId: null }
      });
    }

    return existingMember;
  }

  static async assignTeamLead(teamId: string, payload: IAssignTeamLeadPayload, user: RequestUser, organizationId: string) {
    if (user.organizationRole !== OrganizationRole.ORG_ADMIN) {
      throw new Error("Only organization admins can assign team leads.");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId, organizationId }
    });

    if (!team) throw new Error("Team not found");

    // Verify target user is in the organization
    const orgMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: payload.userId
        }
      }
    });

    if (!orgMember) {
      throw new Error("Target user is not a member of this organization");
    }

    if (orgMember.organizationRole === OrganizationRole.MEMBER) {
      throw new Error("Target user must have at least TEAM_LEAD organization role.");
    }

    // Check if they are in the team, if not add them
    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: payload.userId } }
    });

    if (!existingMember) {
       await prisma.teamMember.create({
         data: { teamId, userId: payload.userId }
       });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { teamLeadId: payload.userId }
    });

    await ActivityService.createActivity({
      organizationId,
      actorId: user.userId,
      action: ActivityAction.ASSIGNED,
      entityType: "TEAM",
      entityId: team.id,
      metadata: { newLeadId: payload.userId },
      description: `Team lead assigned`,
    });

    return updatedTeam;
  }
}
