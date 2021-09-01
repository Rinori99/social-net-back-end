import express from 'express';
import User from './user.model';
import { v4 as uuid } from 'uuid';
import UserService from './user.service';
import passport from 'passport';

class UserController {

    public path: string = '/users';
    public router: express.Router = express.Router();
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/current`, passport.authenticate('jwt', { session: false }), this.getCurrentUser);
        this.router.get(`${this.path}/random`, passport.authenticate('jwt', { session: false }), this.getNRandomPeople);
        this.router.get(`${this.path}/:id/friends`, passport.authenticate('jwt', { session: false }), this.getFriendsByUserId);
        this.router.get(`${this.path}/:id`, passport.authenticate('jwt', { session: false }), this.getUserById);
        this.router.get(this.path, passport.authenticate('jwt', { session: false }), this.getUsersBySimilarName);
        this.router.get(`${this.path}/:profileId/friends-with/:userId`, passport.authenticate('jwt', { session: false }), this.checkFriendship);
        this.router.post(`${this.path}/connection`, passport.authenticate('jwt', { session: false }), this.createFriendship);
        this.router.post(this.path, this.createUser);
        this.router.post(`${this.path}/login`, this.login);
        this.router.delete(`${this.path}/connection`, passport.authenticate('jwt', { session: false }), this.removeFriendship);
    }

    getCurrentUser = (request: express.Request, response: express.Response) => {
        this.userService.findUserById(request.user as string).then(user => {
            response.send(user);
        });
    }

    getUserById = (request: express.Request, response: express.Response) => {
        const userId: string = request.params.id;

        this.userService.findUserById(userId).then(user => {
            response.send(user);
        });
    }

    getNRandomPeople = (request: express.Request, response: express.Response) => {
        const size: number = parseInt(request.query['size'] as string);

        this.userService.findNRandomPeople(size).then(users => {
            response.send(users);
        });
    }

    getFriendsByUserId = (request: express.Request, response: express.Response) => {
        const userId = request.params.id;

        this.userService.findFriendsByUserId(userId).then((users) => {
            response.send(users);
        });
    }

    getUsersBySimilarName = (request: express.Request, response: express.Response) => {
        const name: string = request.query['name'] as string;

        this.userService.findUsersBySimilarName(name).then(users => {
            response.send(users);
        });
    }

    checkFriendship = (request: express.Request, response: express.Response) => {
        const profileId: string = request.params.profileId;
        const userId: string = request.params.userId;

        this.userService.checkFriendship(profileId, userId).then(isConnected => response.send({ isConnected: isConnected}));
    }

    createUser = (request: express.Request, response: express.Response) => {
        const user: User = request.body;
        user.id = uuid();
        user.dateCreated = new Date();

        this.userService.createUser(user).then(() => response.send(201));
    }

    login = (request: express.Request, response: express.Response) => {
        const email = request.body.email;
        const password = request.body.password;

        this.userService.login(email, password).then(res => {
            if (res) {
                response.status(200).send(res);
            } else {
                response.status(401).send({ msg: "Wrong credentials" });
            }
        });
    }

    createFriendship = (request: express.Request, response: express.Response) => {
        const userId1 = request.user as string;
        const userId2 = request.body.friendId;

        this.userService.createFriendship(userId1, userId2).then(() => response.send(201));
    }

    removeFriendship = (request: express.Request, response: express.Response) => {
        const userId1 = request.user as string;
        const userId2 = request.body.friendId;

        this.userService.removeFriendship(userId1, userId2).then(() => response.send(204));
    }
}

export default UserController;
