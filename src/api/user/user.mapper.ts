import UserTransport from './user.transport';
import User from './user.model';

class UserMapper {

    public userToUserTransport(user: User): UserTransport | null {
        if (!user) {
            return null;
        }
        
        return {
            id: user.id,
            dateCreated: user.dateCreated,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            birthdate: user.birthdate,
            livingIn: user.livingIn,
            education: user.education,
            workingAt: user.workingAt,
            hobby: user.hobby,
        }
    }
}

export default UserMapper;
