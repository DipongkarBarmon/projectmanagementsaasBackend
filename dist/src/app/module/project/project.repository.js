import { prisma } from "../../lib/prisma";
const projectInclude = {
    createdBy: { select: { id: true, name: true, email: true } },
    projectMembers: {
        include: { user: { select: { id: true, name: true, email: true } } },
    },
};
const create = (data) => prisma.project.create({ data, include: projectInclude });
const findById = (organizationId, projectId) => prisma.project.findFirst({
    where: { id: projectId, organizationId, deletedAt: null },
    include: projectInclude,
});
const findMany = (organizationId, skip, take, searchTerm) => prisma.project.findMany({
    where: {
        organizationId,
        deletedAt: null,
        ...(searchTerm
            ? { OR: [{ name: { contains: searchTerm, mode: "insensitive" } }, { slug: { contains: searchTerm, mode: "insensitive" } }] }
            : {}),
    },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: projectInclude,
});
const count = (organizationId, searchTerm) => prisma.project.count({
    where: {
        organizationId,
        deletedAt: null,
        ...(searchTerm
            ? { OR: [{ name: { contains: searchTerm, mode: "insensitive" } }, { slug: { contains: searchTerm, mode: "insensitive" } }] }
            : {}),
    },
});
export const ProjectRepository = { create, findById, findMany, count };
