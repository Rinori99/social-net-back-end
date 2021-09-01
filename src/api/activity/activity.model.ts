import BaseEntity from '../base.model';

export type ActivityType = "LIKE" | "FRIENDSHIP";

export interface Activity extends BaseEntity {
    commitedBy: string,
    type: ActivityType,
    targetUser: string | undefined,
}