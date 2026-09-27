import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { OrganizationRole, ActivityAction } from "../../../../generated/prisma/enums";
import { ActivityService } from "../activity/activity.service";
import { ICreateAttachmentPayload } from "./attachment.interface";

export class AttachmentService {
  private static async verifyTaskAccess(taskId: string, organizationId: string, user: RequestUser) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) throw new Error("Task not found");
    if (task.project.organizationId !== organizationId) {
      throw new Error("Task does not belong to this organization");
    }

    const isOrgAdmin = user.organizationRole === OrganizationRole.ORG_ADMIN;
    
    let isProjectManager = false;
    if (user.organizationRole === OrganizationRole.PROJECT_MANAGER) {
       const membership = await prisma.projectMember.findUnique({
         where: { projectId_userId: { projectId: task.projectId, userId: user.userId } }
       });
       if (membership) {
          isProjectManager = true;
       }
    }

    if (!isOrgAdmin && !isProjectManager) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId: user.userId } }
      });
      if (!membership) {
        throw new Error("You do not have access to this project's tasks");
      }
    }

    return { task, isOrgAdmin, isProjectManager };
  }

  static async uploadAttachment(taskId: string, payload: ICreateAttachmentPayload, user: RequestUser, organizationId: string) {
    await this.verifyTaskAccess(taskId, organizationId, user);

    const attachment = await prisma.attachment.create({
      data: {
        ...payload,
        taskId,
        organizationId,
        uploadedById: user.userId,
      }
    });

    await ActivityService.createActivity({
      organizationId,
      actorId: user.userId,
      action: ActivityAction.UPDATED,
      entityType: "TASK",
      entityId: taskId,
      description: `Uploaded attachment ${attachment.originalName}`,
    });

    return attachment;
  }

  static async getAttachments(taskId: string, user: RequestUser, organizationId: string) {
    await this.verifyTaskAccess(taskId, organizationId, user);

    return await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true, avatar: true } }
      }
    });
  }

  static async deleteAttachment(attachmentId: string, user: RequestUser, organizationId: string) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId, organizationId }
    });

    if (!attachment) throw new Error("Attachment not found");

    const { isOrgAdmin, isProjectManager } = await this.verifyTaskAccess(attachment.taskId, organizationId, user);

    const canDelete = attachment.uploadedById === user.userId || isOrgAdmin || isProjectManager;

    if (!canDelete) {
      throw new Error("You do not have permission to delete this attachment");
    }

    // Call Cloudinary delete here if we had the SDK integrated
    // await CloudinaryService.delete(attachment.storageKey);

    return await prisma.attachment.delete({
      where: { id: attachmentId }
    });
  }
}
