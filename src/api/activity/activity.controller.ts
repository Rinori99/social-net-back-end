import express from 'express';
import ActivityService from './activity.service';
import passport from 'passport';

class ActivityController {

    private path: string = '/activities';
    private router: express.Router = express.Router();
    private activityService: ActivityService;

    constructor() {
        this.activityService = new ActivityService();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(this.path, passport.authenticate('jwt', { session: false }), this.getActivitiesByUserId);
    }

    getActivitiesByUserId = async (request: express.Request, response: express.Response) => {
        const userId: string = request.query['userId'] as string;

        this.activityService.findActivitiesByUserId(userId).then(activities => {
            response.send(activities);
        });
    }
}

export default ActivityController;
