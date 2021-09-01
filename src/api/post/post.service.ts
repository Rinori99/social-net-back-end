import PostTransport from './post.transport';
import UserTransport from '../user/user.transport';
import pool from '../../database/connection';
import Post from './post.model';
import User from '../user/user.model';
import UserMapper from '../user/user.mapper';
import UserService from '../user/user.service';
import { v4 as uuid } from 'uuid';

class PostService {

    private userService: UserService;
    private userMapper: UserMapper;

    constructor() {
        this.userService = new UserService();
        this.userMapper = new UserMapper();
    }
    
    public async findFeedPostsForUser(userId: string): Promise<PostTransport[]> {
        const postsResult = await pool.query('SELECT * FROM post WHERE posted_by IN (SELECT friend_2_id FROM friendship WHERE friend_1_id = $1)', [userId]);
        const posts: Post[] = postsResult.rows.map((postRow: any) => this.mapPostRowToPost(postRow));
        
        return this.getPostTransportsFromPosts(posts);
    }

    public async findPostsByHashtag(hashtag: string): Promise<PostTransport[]> {
        const postsResult = await pool.query(`SELECT * FROM post WHERE content LIKE '%#${hashtag}%'`);
        const posts: Post[] = postsResult.rows.map((postRow: any) => this.mapPostRowToPost(postRow));

        return this.getPostTransportsFromPosts(posts);
    }

    public async findPostsByUserId(userId: string): Promise<PostTransport[]> {
        const postsResult = await pool.query('SELECT * FROM post WHERE posted_by = $1', [userId]);
        const posts: Post[] = postsResult.rows.map((postRow: any) => this.mapPostRowToPost(postRow));

        return this.getPostTransportsFromPosts(posts);
    }

    public async createPost(postedBy: string, content: string): Promise<PostTransport> {
        const id: string = uuid();
        const dateCreated = new Date();

        await pool.query('INSERT INTO post (id, date_created, posted_by, content) VALUES ($1, $2, $3, $4)',
                [uuid(), new Date(), postedBy, content], (error: any, results: any) => {
            if (error) {
                throw error
            }
            if (content.includes("#")) {
                this.handleHashtags(content);
            }
        });

        return this.getPostTransportFromPost({
            id: id,
            dateCreated: dateCreated,
            content: content,
            postedBy: postedBy
        });
    }

    public async updatePostContent(postId: string, content: string): Promise<void> {
        await pool.query('UPDATE post SET content = $1 WHERE id = $2', 
            [content, postId], (error: any, results: any) => {
            if (error) {
                throw error
            }

            if (content.includes("#")) {
                this.handleHashtags(content);
            }
        });
    }

    public async deletePostById(postId: string): Promise<void> {
        await pool.query('DELETE FROM post_like WHERE post_id = $1', [postId], (error: any, results: any) => {
            if (error) {
                throw error;
            }
            pool.query('DELETE FROM post WHERE id = $1', [postId], (err: any, res: any) => {
                if (err) {
                    throw err;
                }
            }); 
        });
    }

    private handleHashtags(content: string): void {
        const hashtags: string[] = [];
        let contentLeft: string = content;
        
        while (contentLeft.includes("#")) {
            const startStrIndex = contentLeft.indexOf("#");
            const endStrIndex = startStrIndex + contentLeft.substring(startStrIndex).indexOf(" ");

            let hashtagContent: string = "";
            if (endStrIndex < 0) {
                hashtagContent = contentLeft.substring(startStrIndex);
            } else {
                hashtagContent = contentLeft.substring(startStrIndex + 1, endStrIndex);
            }

            if (hashtagContent) {
                hashtags.push(hashtagContent);
            }

            contentLeft = contentLeft.substring(startStrIndex + 1);
        }

        let valuesSqlExpression: string = "";
        const valuesArr: string[] = [];
        let count = 1;

        hashtags.forEach(hashtag => {
            valuesSqlExpression += `($${count++}, $${count++}, $${count++}),`;
            valuesArr.push(uuid());
            valuesArr.push(new Date().toDateString());
            valuesArr.push(hashtag);
        });

        valuesSqlExpression = valuesSqlExpression.substring(0, valuesSqlExpression.length - 1);

        pool.query('INSERT INTO hashtag (id, date_created, hashtag) VALUES ' + valuesSqlExpression, valuesArr, 
                    (err: any, res: any) => {
            if (err) {
                throw err;
            }
        });
    }

    private mapPostRowToPost(postRow: any): Post {
        return {
            id: postRow['id'],
            dateCreated: postRow['date_created'],
            postedBy: postRow['posted_by'],
            content: postRow['content']
        }
    }

    private async getPostTransportFromPost(post: Post): Promise<PostTransport> {
        const currentUserId: string = 'aef0f147-7cc2-4c91-bfa5-2554eae876d1';
        const postedByUser: User = await this.userService.findUserById(post.postedBy) as User;
        const likesCountResult = await pool.query('SELECT COUNT(*) as likes_count FROM post_like WHERE post_id = $1', [post.id]);
        const likesCount: number = likesCountResult.rows[0]['likes_count'] as number;
        const isLikedByMeResult = await pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM post_like WHERE post_id = $1 AND liked_by = $2) THEN CAST(1 as BIT) ELSE CAST(0 as BIT) END',
                                                    [post.id, currentUserId]);
        const isLikedByMe: boolean = isLikedByMeResult.rows[0]['case'] == "0" ? false : true;

        return {
            id: post.id,
            dateCreated: post.dateCreated,
            postedBy: this.userMapper.userToUserTransport(postedByUser) as UserTransport,
            content: post.content,
            likes: likesCount,
            isLikedByMe: isLikedByMe,
        }        
    }

    private async getPostTransportsFromPosts(posts: Post[]): Promise<PostTransport[]> {
        // to be deleted when authentication is implemented:
        const currentUserId: string = 'aef0f147-7cc2-4c91-bfa5-2554eae876d1';

        const postTransports: PostTransport[] = [];

        for (let i = 0; i < posts.length; i++) {
            const postedByUser: User = await this.userService.findUserById(posts[i].postedBy) as User;

            const likesCountResult = await pool.query('SELECT COUNT(*) as likes_count FROM post_like WHERE post_id = $1', [posts[i].id]);
            const likesCount: number = likesCountResult.rows[0]['likes_count'] as number;

            const isLikedByMeResult = await pool.query('SELECT CASE WHEN EXISTS (SELECT * FROM post_like WHERE post_id = $1 AND liked_by = $2) THEN CAST(1 as BIT) ELSE CAST(0 as BIT) END',
                                                 [posts[i].id, currentUserId]);
            const isLikedByMe: boolean = isLikedByMeResult.rows[0]['case'] == "0" ? false : true;

            postTransports.push({
                id: posts[i].id,
                dateCreated: posts[i].dateCreated,
                postedBy: this.userMapper.userToUserTransport(postedByUser) as UserTransport,
                content: posts[i].content,
                likes: likesCount,
                isLikedByMe: isLikedByMe,
            });
        }

        return postTransports;
    }
}

export default PostService;