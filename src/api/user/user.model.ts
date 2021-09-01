import BaseEntity from '../base.model';

export default interface User extends BaseEntity {
    email: string,
    password: string,
    salt: string,
    firstName: string,
    lastName: string,
    birthdate: Date,
    livingIn: string,
    education: string,
    workingAt: string,
    hobby: string,
}
