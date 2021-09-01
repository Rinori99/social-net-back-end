import User from '../user/user.model';
import UserTransport from '../user/user.transport';
import { ActivityType } from './activity.model';

export interface ActivityTransport {
    id: string,
    commitedBy: UserTransport,
    type: ActivityType,
    targetUser: UserTransport | null,
}
