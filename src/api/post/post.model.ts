import BaseEntity from '../base.model';

export default interface Post extends BaseEntity {
    postedBy: string,
    content: string,
}
