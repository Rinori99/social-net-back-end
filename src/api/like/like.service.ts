import pool from '../../database/connection';
import { v4 as uuid } from 'uuid';
import Like from './like.model';
import LikeTransport from './like.transport';
import UserTransport from 'api/user/user.transport';
import User from 'api/user/user.model';
import UserMapper from '../user/user.mapper';
import UserService from '../user/user.service';


class LikeService {

    private userService: UserService;
    private userMapper: UserMapper;

    constructor() {
        this.userService = new UserService();
        this.userMapper = new UserMapper();
    }

    public async findLikesByPostId(postId: string): Promise<LikeTransport[]> {
        const postLikesResult = await pool.query('SELECT * FROM post_like WHERE post_id = $1', [postId]);
        const likes: Like[] = postLikesResult.rows.map((postLikeRow: any) => this.mapPostLikeRowToLike(postLikeRow));

        return this.getLikeTransportsFromLikes(likes);
    }

    public async likePost(postId: string, userId: string): Promise<void> {
        await pool.query('INSERT INTO post_like (id, date_created, liked_by, post_id) VALUES ($1, $2, $3, $4)', 
                [uuid(), new Date(), userId, postId], (error: any, results: any) => {
            if (error) {
                throw error
            }
            pool.query('INSERT INTO activity (id, date_created, commited_by, ac_type) VALUES ($1, $2, $3, $4)', 
                        [uuid(), new Date(), userId, "LIKE"], (err: any, res: any) => {
                if (err) {
                    throw err;
                }
            });
        });
    }

    public async unlikePost(postId: string, userId: string): Promise<void> {
        await pool.query('DELETE FROM post_like WHERE post_id = $1 AND liked_by = $2', 
                [postId, userId], (error: any, results: any) => {
            if (error) {
                throw error
            }
        });
    }

    private mapPostLikeRowToLike(postLikeRow: any): Like {
        return {
            id: postLikeRow['id'],
            dateCreated: postLikeRow['date_created'],
            likedBy: postLikeRow['liked_by'],
            postId: postLikeRow['post_id'],
        }
    }

    private async getLikeTransportsFromLikes(likes: Like[]): Promise<LikeTransport[]> {
        const likeTransports: LikeTransport[] = [];

        for (let i = 0; i < likes.length; i++) {
            const like: Like = likes[i];

            const likedByUser: User = await this.userService.findUserById(like.likedBy) as User;

            likeTransports.push({
                id: like.id,
                dateCreated: like.dateCreated,
                likedBy: this.userMapper.userToUserTransport(likedByUser) as UserTransport,
                postId: like.postId,
            });
        }

        return likeTransports;
    }
}

export default LikeService;