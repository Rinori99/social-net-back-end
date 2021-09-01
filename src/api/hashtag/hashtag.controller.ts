import express from 'express';
import HashtagService from './hashtag.service';
import passport from 'passport';

class HashtagController {

    public path: string = '/hashtags';
    public router: express.Router = express.Router();
    private hashtagService: HashtagService;

    constructor() {
        this.hashtagService = new HashtagService();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(this.path, passport.authenticate('jwt', { session: false }), this.getTrendyHashtags);
    }

    getTrendyHashtags = (request: express.Request, response: express.Response) => {
        const size: number = parseInt(request.query['size'] as string);

        this.hashtagService.findTrendyHashtags(size).then(hashtags => response.send(hashtags));
    }
}

export default HashtagController;
