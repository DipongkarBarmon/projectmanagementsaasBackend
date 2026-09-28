import { prisma } from "../../lib/prisma";
const createActivity = async (payload) => {
    try {
        return await prisma.activity.create({
            data: {
                organizationId: payload.organizationId,
                actorId: payload.actorId,
                action: payload.action,
                entityType: payload.entityType,
                entityId: payload.entityId,
                description: payload.description,
                metadata: payload.metadata ? JSON.parse(JSON.stringify(payload.metadata)) : undefined,
            }
        });
    }
    catch (error) {
        console.error("Failed to create activity log", error);
    }
};
const getOrganizationActivities = async (organizationId, user) => {
    if (user.organizationId !== organizationId) {
        throw new Error("User does not belong to this organization");
    }
    const organizationExists = await prisma.organization.findUnique({
        where: { id: organizationId }
    });
    if (!organizationExists) {
        throw new Error("Organization not found");
    }
    const activities = await prisma.activity.findMany({
        where: {
            organizationId
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            actor: { select: { id: true, name: true, avatar: true } }
        }
    });
    return activities;
};
const getEntityActivities = async (organizationId, entityType, entityId, user) => {
    if (user.organizationId !== organizationId) {
        throw new Error("User does not belong to this organization");
    }
    const organizationExists = await prisma.organization.findUnique({
        where: { id: organizationId }
    });
    if (!organizationExists) {
        throw new Error("Organization not found");
    }
    const activities = await prisma.activity.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            actor: { select: { id: true, name: true, avatar: true } }
        }
    });
    return activities;
};
export const ActivityService = {
    createActivity,
    getOrganizationActivities,
    getEntityActivities
};
