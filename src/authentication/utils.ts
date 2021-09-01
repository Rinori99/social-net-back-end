import crypto from 'crypto';
import fs from 'fs';
import User from 'api/user/user.model';
import jsonwebtoken from 'jsonwebtoken';
import path from 'path';

const PRIV_KEY = fs.readFileSync(path.join(__dirname, 'id_rsa_priv.pem'), 'utf8');

export const isPasswordValid = (password: string, hash: string, salt: string) => {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

export const genPassword = (password: string) => {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
        salt: salt,
        hash: genHash
    };
}

export const issueJWT = (user: User) => {
    const _id = user.id;

    const expiresIn = '2w';

    const payload = {
        sub: _id,
        iat: Date.now()
    };

    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

    return {
        token: signedToken,
        expires: expiresIn
    }
}
