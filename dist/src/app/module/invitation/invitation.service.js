import path from "path";
import { prisma } from "../../lib/prisma";
import crypto from "crypto";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import config from "../../config";
import { InvitationStatus } from "../../../../generated/prisma/enums";
const sentInvitations = async (payload, organizationId, userId) => {
    if (!payload.email || !payload.organizationRole) {
        throw new Error("Email and organization role are required");
    }
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId
        }
    });
    if (!organization) {
        throw new Error("Organization not found");
    }
    const user = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });
    if (user) {
        const existingMembership = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId,
                    userId: user.id
                }
            }
        });
        if (existingMembership) {
            throw new Error("You are already a member of this organization");
        }
    }
    // Here you can implement the logic to send the invitation, e.g., save it to the database, send an email, etc.
    const token = crypto.randomBytes(32).toString("hex");
    console.log("Generated token:", token);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7); // 24 hours from now
    const invitation = await prisma.invitation.create({
        data: {
            email: payload.email,
            organizationRole: payload.organizationRole,
            invitedById: userId,
            organizationId: organizationId,
            token: tokenHash,
            expiresAt: expiresAt
        }
    });
    if (!invitation) {
        throw new Error("Fail to create invitation,Please try again");
    }
    const invitatedUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if (!invitatedUser) {
        throw new Error("Invitated user not found");
    }
    const templatePath = path.join(process.cwd(), 'src/app/templates/invitation-mail.ejs');
    const templateData = {
        organizationName: organization.name,
        invitedByName: invitatedUser.name,
        invitationUrl: `${config.frontend_url}/invitation/accept/${token}`,
        expiresAt,
        year: new Date().getFullYear(),
    };
    const html = await ejs.renderFile(templatePath, templateData);
    await transporter.sendMail({
        from: `TaskFlow <${config.smtp_sender}>`,
        to: payload.email,
        subject: `${invitatedUser.name} invited you to join ${organization.name} on TaskFlow`,
        html
    });
};
const hashInvitationToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const getInvitationByToken = async (token) => {
    if (!token) {
        throw new Error("Invitation token is required");
    }
    const invitation = await prisma.invitation.findUnique({
        where: { token: hashInvitationToken(token) },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                },
            },
            invitedBy: {
                select: {
                    name: true,
                },
            },
        },
    });
    if (!invitation) {
        throw new Error("Invalid invitation");
    }
    if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error(`Invitation is ${invitation.status.toLowerCase()}`);
    }
    if (invitation.expiresAt < new Date()) {
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: InvitationStatus.EXPIRED },
        });
        throw new Error("Invitation expired");
    }
    return {
        email: invitation.email,
        organizationId: invitation.organizationId,
        organizationRole: invitation.organizationRole,
        expiresAt: invitation.expiresAt,
        organization: invitation.organization,
        invitedBy: invitation.invitedBy,
    };
};
const acceptInvitation = async (token, userId) => {
    if (!userId) {
        throw new Error("User ID is required");
    }
    const invitation = await prisma.invitation.findUnique({
        where: { token: hashInvitationToken(token) },
    });
    if (!invitation) {
        throw new Error("Invalid invitation");
    }
    if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error(`Invitation is ${invitation.status.toLowerCase()}`);
    }
    if (invitation.expiresAt < new Date()) {
        throw new Error("Invitation expired");
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new Error("This invitation belongs to a different email address");
    }
    const result = await prisma.$transaction(async (transaction) => {
        const membership = await transaction.organizationMember.upsert({
            where: {
                organizationId_userId: {
                    organizationId: invitation.organizationId,
                    userId,
                },
            },
            update: {
                organizationRole: invitation.organizationRole,
            },
            create: {
                organizationId: invitation.organizationId,
                userId,
                organizationRole: invitation.organizationRole,
            },
        });
        await transaction.invitation.update({
            where: { id: invitation.id },
            data: {
                status: InvitationStatus.ACCEPTED,
                acceptedAt: new Date(),
            },
        });
        return membership;
    });
    return result;
};
export const InvitationService = {
    sentInvitations,
    getInvitationByToken,
    acceptInvitation
};
