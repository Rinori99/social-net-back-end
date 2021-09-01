import BaseEntity from '../base.model';

export default interface Like extends BaseEntity {
    likedBy: string,
    postId: string,
}