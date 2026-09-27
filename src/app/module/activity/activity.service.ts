import { ActivityAction } from "../../../../generated/prisma/enums";

export interface CreateActivityPayload {
  organizationId: string;
  actorId: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export class ActivityService {
  /**
   * Stub for ActivityService.createActivity
   * This module is planned to be implemented later (Step 7).
   */
  static async createActivity(payload: CreateActivityPayload) {
    // TODO: Implement actual activity creation
    console.log("Activity triggered:", payload);
    return;
  }
}
