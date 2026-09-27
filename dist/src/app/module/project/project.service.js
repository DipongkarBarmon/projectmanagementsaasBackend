import { OrganizationRole, UserStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
const createProjectSlug = (name) => {
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return slug;
};
const createProject = async (organizationId, userId, payload) => {
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });
    if (!organization) {
        throw new Error("Organization not found");
    }
    const member = await prisma.organizationMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId,
                userId,
            },
        },
    });
    if (!member) {
        throw new Error("You are not a member of this organization");
    }
    const result = await prisma.$transaction(async (transaction) => {
        const project = await transaction.project.create({
            data: {
                organizationId,
                createdById: userId,
                name: payload.name,
                slug: payload.slug || createProjectSlug(payload.name),
                description: payload.description,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return project;
    });
    return result;
};
const getAllProjects = async (organizationId, query) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";
    const addConditions = [];
    if (query.searchTerm) {
        addConditions.push({
            OR: [
                {
                    name: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    slug: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
        });
    }
    if (query.name) {
        addConditions.push({
            name: query.name
        });
    }
    if (query.slug) {
        addConditions.push({
            slug: query.slug
        });
    }
    if (query.description) {
        addConditions.push({
            description: query.description
        });
    }
    const projects = await prisma.project.findMany({
        where: {
            AND: addConditions
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            projectMembers: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        }
    });
    const total = await prisma.project.count({
        where: {
            AND: addConditions
        },
    });
    const totalPages = Math.ceil(total / limit);
    return {
        data: projects,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};
const getProject = async (organizationId, projectId) => {
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });
    if (!organization) {
        throw new Error("Organization not found");
    }
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
            organizationId,
            deletedAt: null,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            projectMembers: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    return project;
};
const getActivity = async (organizationId, projectId) => {
    await getProject(organizationId, projectId);
    return [];
};
const updateProject = async (organizationId, projectId, userId, payload) => {
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });
    if (!organization) {
        throw new Error("Organization not found");
    }
    const isxistingProject = await prisma.project.findUnique({
        where: {
            id: projectId
        },
    });
    if (!isxistingProject) {
        throw new Error("Project not found");
    }
    const updateData = {};
    if (payload.name !== undefined) {
        updateData.name = payload.name;
    }
    if (payload.description !== undefined) {
        updateData.description = payload.description;
    }
    if (payload.status !== undefined) {
        updateData.status = payload.status;
    }
    if (payload.startDate !== undefined) {
        updateData.startDate = payload.startDate
            ? new Date(payload.startDate)
            : null;
    }
    if (payload.endDate !== undefined) {
        updateData.endDate = payload.endDate
            ? new Date(payload.endDate)
            : null;
    }
    const project = await prisma.project.update({
        where: {
            id: projectId,
        },
        data: updateData,
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            projectMembers: true,
        },
    });
    return project;
};
const deleteProject = async (projectId) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    const existingProject = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!existingProject) {
        throw new Error("Project not found");
    }
    const project = await prisma.project.delete({
        where: {
            id: projectId,
        }
    });
    return project;
};
const assignProjectManager = async (organizationId, projectId, memberId) => {
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    if (!memberId) {
        throw new Error("Member ID is required");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: memberId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }
    if (user.status === UserStatus.DELETED || user.isDeleted === true) {
        throw new Error("User is deleted");
    }
    if (user.emailVerified === false) {
        throw new Error("User email is not verified");
    }
    const isExistingProject = await prisma.project.findUnique({
        where: {
            id: projectId,
            organizationId,
        },
    });
    if (!isExistingProject) {
        throw new Error("Project not found");
    }
    const manager = await prisma.organizationMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId,
                userId: memberId,
            },
        },
    });
    if (!manager) {
        throw new Error("Member not found in the organization");
    }
    const updateOrganizationMember = await prisma.organizationMember.update({
        where: {
            organizationId_userId: {
                organizationId,
                userId: memberId,
            },
        },
        data: {
            role: OrganizationRole.PROJECT_MANAGER,
        },
    });
    const projectManager = await prisma.projectMember.upsert({
        where: {
            projectId_userId: {
                projectId,
                userId: manager.userId,
            },
        },
        update: {
            projectId,
            userId: manager.userId,
        },
        create: {
            projectId,
            userId: manager.userId,
        },
    });
    return projectManager;
};
const addMember = async (organizationId, projectId, memberId) => {
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    if (!memberId) {
        throw new Error("Member ID is required");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: memberId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }
    if (user.status === UserStatus.DELETED || user.isDeleted === true) {
        throw new Error("User is deleted");
    }
    if (user.emailVerified === false) {
        throw new Error("User email is not verified");
    }
    const isExistingProject = await prisma.project.findUnique({
        where: {
            id: projectId,
            organizationId,
        },
    });
    if (!isExistingProject) {
        throw new Error("Project not found");
    }
    const manager = await prisma.organizationMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId,
                userId: memberId,
            },
        },
    });
    if (!manager) {
        throw new Error("Member not found in the organization");
    }
    const updateOrganizationMember = await prisma.organizationMember.update({
        where: {
            organizationId_userId: {
                organizationId,
                userId: memberId,
            },
        },
        data: {
            role: OrganizationRole.MEMBER,
        },
    });
    const projectMember = await prisma.projectMember.upsert({
        where: {
            projectId_userId: {
                projectId,
                userId: manager.userId,
            },
        },
        update: {
            projectId,
            userId: manager.userId,
        },
        create: {
            projectId,
            userId: manager.userId,
        },
    });
    return projectMember;
};
const removeMember = async (organizationId, projectId, memberId) => {
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    if (!memberId) {
        throw new Error("Member ID is required");
    }
    const isExistingProject = await prisma.project.findUnique({
        where: {
            id: projectId,
            organizationId,
        },
    });
    if (!isExistingProject) {
        throw new Error("Project not found");
    }
    const isExistingMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: memberId,
            },
        },
    });
    if (!isExistingMember) {
        throw new Error("Member not found in the project");
    }
    const projectMember = await prisma.projectMember.delete({
        where: {
            projectId_userId: {
                projectId,
                userId: memberId,
            },
        },
    });
    return projectMember;
};
export const ProjectService = {
    createProject,
    getAllProjects,
    getProject,
    getActivity,
    updateProject,
    deleteProject,
    assignProjectManager,
    addMember,
    removeMember,
};
