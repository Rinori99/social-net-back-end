import pool from '../../database/connection';
import { Activity, ActivityType } from './activity.model';
import { ActivityTransport } from './activity.transport';
import User from '../user/user.model';
import UserService from '../user/user.service';
import UserTransport from 'api/user/user.transport';
import UserMapper from '../user/user.mapper';

class ActivityService {

    private userService: UserService;
    private userMapper: UserMapper;

    constructor() {
        this.userService = new UserService();
        this.userMapper = new UserMapper();
    }

    public async findActivitiesByUserId(userId: string): Promise<ActivityTransport[]> {
        const activitiesResult = await pool.query('SELECT * FROM activity WHERE commited_by = $1', [userId]);
        const activities: Activity[] = activitiesResult.rows.map((row: any) => this.mapActivityRowToActivity(row));

        return this.getActivityTransportsFromActivities(activities);
    }

    private mapActivityRowToActivity(activityRow: any): Activity {
        return {
            id: activityRow['id'],
            dateCreated: activityRow['date_created'] as Date,
            commitedBy: activityRow['commited_by'],
            type: activityRow['ac_type'] as ActivityType,
            targetUser: activityRow['target_user'],
        };
    }

    private async getActivityTransportsFromActivities(activities: Activity[]): Promise<ActivityTransport[]> {
        const activityTransports: ActivityTransport[] = [];

        for (let i = 0; i < activities.length; i++) {
            const activity: Activity = activities[i];

            const commitedByUser: User = await this.userService.findUserById(activity.commitedBy) as User;
            const targetUser: User | null = await this.userService.findUserById(activity.targetUser as string);
    
            activityTransports.push({
                id: activity.id,
                commitedBy: this.userMapper.userToUserTransport(commitedByUser) as UserTransport,
                type: activity.type,
                targetUser: this.userMapper.userToUserTransport(targetUser as User),
            });
        }

        return activityTransports;
    }
}

export default ActivityService;