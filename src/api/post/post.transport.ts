import UserTransport from '../user/user.transport';

export default interface PostTransport {
    id: string,
    dateCreated: Date,
    postedBy: UserTransport,
    content: string,
    likes: number,
    isLikedByMe: boolean,
}
