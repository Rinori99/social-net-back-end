import express from 'express';
import PostService from './post.service';
import passport from 'passport';

class PostController {
    
    public path: string = '/posts';
    public router: express.Router = express.Router();
    private postService: PostService;

    constructor() {
        this.postService = new PostService();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/hashtag`, passport.authenticate('jwt', { session: false }), this.getPostsByHashtag);
        this.router.get(`${this.path}/feed`, passport.authenticate('jwt', { session: false }), this.getFeedPostsForUser);
        this.router.get(this.path, passport.authenticate('jwt', { session: false }), this.getPostsByUserId);
        this.router.post(this.path, passport.authenticate('jwt', { session: false }), this.createPost);
        this.router.put(`${this.path}/:id/content`, passport.authenticate('jwt', { session: false }), this.updatePostContent);
        this.router.delete(`${this.path}/:id`, passport.authenticate('jwt', { session: false }), this.deletePostById);
    }

    getFeedPostsForUser = (request: express.Request, response: express.Response) => {
        this.postService.findFeedPostsForUser(request.user as string).then(posts => response.send(posts));
    }

    getPostsByHashtag = (request: express.Request, response: express.Response) => {
        const hashtag: string = request.query['hashtag'] as string;

        this.postService.findPostsByHashtag(hashtag, request.user as string).then(posts => response.send(posts));
    }

    getPostsByUserId = (request: express.Request, response: express.Response) => {
        const userId: string = request.query['userId'] ? (request.query['userId'] as string) : (request.user as string);

        this.postService.findPostsByUserId(userId, request.user as string).then(posts => response.send(posts));
    }

    createPost = (request: express.Request, response: express.Response) => {
        this.postService.createPost(request.user as string, request.body.content).then(post => response.send(post));
    }

    updatePostContent = (request: express.Request, response: express.Response) => {
        const postId = request.params.id;

        this.postService.updatePostContent(postId, request.body.content).then(() => response.send(204));
    }

    deletePostById = (request: express.Request, response: express.Response) => {
        const postId = request.params.id;

        this.postService.deletePostById(postId).then(() => response.send(204));
    }
}

export default PostController;
