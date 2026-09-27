import { z } from "zod";

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Team name must be at least 2 characters").max(100),
    description: z.string().max(500).optional(),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const assignTeamLeadSchema = z.object({
  body: z.object({
    userId: z.string().uuid("Invalid user ID format"),
  }),
});

export const addTeamMemberSchema = assignTeamLeadSchema; // Same structure
