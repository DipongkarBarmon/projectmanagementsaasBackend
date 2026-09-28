import { prisma } from "../../lib/prisma";
import { OrganizationRole, ActivityAction } from "../../../../generated/prisma/enums";
import { ActivityService } from "../activity/activity.service";
export class CommentService {
    static async verifyTaskAccess(taskId, organizationId, user) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task)
            throw new Error("Task not found");
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
    static async createComment(taskId, payload, user, organizationId) {
        const { task } = await this.verifyTaskAccess(taskId, organizationId, user);
        const comment = await prisma.comment.create({
            data: {
                content: payload.content,
                taskId,
                userId: user.userId,
            }
        });
        await ActivityService.createActivity({
            organizationId,
            actorId: user.userId,
            action: ActivityAction.COMMENTED,
            entityType: "TASK",
            entityId: taskId,
            metadata: { commentId: comment.id },
            description: `Added a comment to task`,
        });
        return comment;
    }
    static async getComments(taskId, user, organizationId) {
        await this.verifyTaskAccess(taskId, organizationId, user);
        return await prisma.comment.findMany({
            where: { taskId },
            orderBy: { createdAt: 'asc' },
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            }
        });
    }
    static async updateComment(commentId, payload, user, organizationId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { task: true }
        });
        if (!comment)
            throw new Error("Comment not found");
        await this.verifyTaskAccess(comment.taskId, organizationId, user);
        if (comment.userId !== user.userId) {
            throw new Error("You can only edit your own comments");
        }
        return await prisma.comment.update({
            where: { id: commentId },
            data: payload
        });
    }
    static async deleteComment(commentId, user, organizationId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { task: true }
        });
        if (!comment)
            throw new Error("Comment not found");
        const { isOrgAdmin, isProjectManager } = await this.verifyTaskAccess(comment.taskId, organizationId, user);
        const canDelete = comment.userId === user.userId || isOrgAdmin || isProjectManager;
        if (!canDelete) {
            throw new Error("You do not have permission to delete this comment");
        }
        return await prisma.comment.delete({
            where: { id: commentId }
        });
    }
}
