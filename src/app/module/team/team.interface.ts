export interface ICreateTeamPayload {
  name: string;
  description?: string;
}

export interface IUpdateTeamPayload {
  name?: string;
  description?: string;
}

export interface IAssignTeamLeadPayload {
  userId: string;
}

export interface IAddTeamMemberPayload {
  userId: string;
}
