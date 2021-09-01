import UserTransport from "../user/user.transport";

export default interface LikeTransport {
    id: string,
    dateCreated: Date,
    likedBy: UserTransport,
    postId: string,
}