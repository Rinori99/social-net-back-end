import express from 'express';
import LikeService from './like.service';
import passport from 'passport';

class LikeController {

    public path: string = '/likes';
    public router: express.Router = express.Router();
    private likeService: LikeService;

    constructor() {
        this.likeService = new LikeService();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(this.path, passport.authenticate('jwt', { session: false }), this.getLikesByPostId);
        this.router.post(this.path, passport.authenticate('jwt', { session: false }), this.likePost);
        this.router.delete(this.path, passport.authenticate('jwt', { session: false }), this.unlikePost);
    }

    getLikesByPostId = (request: express.Request, response: express.Response) => {
        const postId: string = request.query['postId'] as string;

        this.likeService.findLikesByPostId(postId).then(likes => response.send(likes));
    }

    likePost = (request: express.Request, response: express.Response) => {
        const postId: string = request.query['postId'] as string;

        this.likeService.likePost(postId, request.user as string).then(() => response.send(201));
    }

    unlikePost = (request: express.Request, response: express.Response) => {
        const postId: string = request.query['postId'] as string;

        this.likeService.unlikePost(postId, request.user as string).then(() => response.send(204));
    }
}

export default LikeController;
