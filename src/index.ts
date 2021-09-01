import App from './app';
import UserController from './api/user/user.controller';
import PostController from './api/post/post.controller';
import LikesController from './api/like/like.controller';
import ActivityController from './api/activity/activity.controller';
import HashtagController from './api/hashtag/hashtag.controller';

const app = new App(
    [
        new UserController(),
        new PostController(),
        new LikesController(),
        new ActivityController(),
        new HashtagController(),
    ],
    5000,
);

app.listen();
