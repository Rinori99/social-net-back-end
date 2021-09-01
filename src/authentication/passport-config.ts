import UserService from '../api/user/user.service';
import passportJwt from 'passport-jwt';
import fs from 'fs';
import path from 'path';

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const userService = new UserService();

const pathToKey = path.join(__dirname, 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

export const configure = (passport: any) => {
    passport.use(new JwtStrategy(options, (jwt_payload: any, done: any) => {
        userService.findUserById(jwt_payload.sub).then(user => {
            if (user) {
                return done(null, user.id);
            } else {
                return done(null, false);
            }
        });
    }));
}
