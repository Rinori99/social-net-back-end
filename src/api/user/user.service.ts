import User from './user.model';
import pool from '../../database/connection';
import { v4 as uuid } from 'uuid';
import e = require('express');
import authenticationUtils = require('../../authentication/utils');

class UserService {

    public async findUserById(userId: string): Promise<User | null> {
        const usersResult = await pool.query('SELECT * FROM person WHERE id = $1', [userId]);

        if (!usersResult.rows[0]) {
            return null;
        }

        return this.mapUserRowToUser(usersResult.rows[0]);
    }

    public async findUserByEmail(email: string): Promise<User | null> {
        const usersResult = await pool.query('SELECT * FROM person where email = $1', [email]);

        if (!usersResult.rows[0]) {
            return null;
        }

        return this.mapUserRowToUser(usersResult.rows[0]);
    }

    public async findNRandomPeople(size: number): Promise<User[]> {
        const userResults = await pool.query('SELECT * FROM person LIMIT $1', [size]);

        return userResults.rows.map((userRow: any) => this.mapUserRowToUser(userRow));
    }

    public async findFriendsByUserId(userId: string): Promise<User[]> {
        const userResults = await pool.query('SELECT * FROM person p WHERE p.id IN (SELECT friend_2_id FROM friendship f1 WHERE f1.friend_1_id = $1)', [userId]);
        
        return userResults.rows.map((userRow: any) => this.mapUserRowToUser(userRow));
    }

    public async findUsersBySimilarName(name: string): Promise<User[]> {
        const userResults = await pool.query(`SELECT * FROM person p WHERE LOWER(p.first_name) LIKE LOWER('%${name}%') OR LOWER(p.last_name) LIKE LOWER('%${name}%')`);

        return userResults.rows.map((userRow: any) => this.mapUserRowToUser(userRow));
    }

    public async checkFriendship(profileId: string, userId: string): Promise<boolean> {
        const friendshipResult = await pool.query(`SELECT CASE WHEN EXISTS (SELECT * FROM friendship WHERE friend_1_id = $1 AND friend_2_id = $2) THEN CAST(1 as BIT) ELSE CAST(0 as BIT) END`,
                                             [userId, profileId]);

        const isConnected: boolean = friendshipResult.rows[0]['case'] == "0" ? false : true;
        return isConnected;
    }

    public async createUser(user: User): Promise<void> {
        const saltHash = authenticationUtils.genPassword(user.password);

        user.password = saltHash.hash;
        user.salt = saltHash.salt;

        await pool.query('INSERT INTO person (id, email, password, date_created, first_name, last_name, birthdate,'
                + ' living_in, education, working_at, hobby, salt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', 
                [user.id, user.email, user.password, user.dateCreated, user.firstName, user.lastName, user.birthdate,
                user.livingIn, user.education, user.workingAt, user.hobby, user.salt], (err: any, res: any) => {
                    if (err) {
                        throw err;
                    }
                });
    }

    public async login(email: string, password: string): Promise<any> {
        const user: User  = await this.findUserByEmail(email) as User;

        if (!user) {
            return null;
        }

        const isValid = authenticationUtils.isPasswordValid(password, user.password, user.salt);

        if (isValid) {
            const tokenObject = authenticationUtils.issueJWT(user);
            
            return {
                success: true, 
                token: "Bearer " + tokenObject.token,
                expiresIn: tokenObject.expires,
            }
        } else {
            return null;
        }
    }

    public async createFriendship(userId1: string, userId2: string): Promise<void> {
        await pool.query('INSERT INTO friendship (id, date_created, friend_1_id, friend_2_id) VALUES ($1, $2, $3, $4)', 
                    [uuid(), new Date(), userId1, userId2], (error: any, results: any) => {
            if (error) {
                throw error
            }
            pool.query('INSERT INTO activity (id, date_created, commited_by, ac_type, target_user) VALUES ($1, $2, $3, $4, $5)', 
                        [uuid(), new Date(), userId1, "FRIENDSHIP", userId2], (err: any, res: any) => {
                if (err) {
                    throw err;
                }
            });
        });
    }

    public async removeFriendship(userId1: string, userId2: string): Promise<void> {
        await pool.query('DELETE FROM friendship WHERE friend_1_id = $1 AND friend_2_id = $2', [userId1, userId2], 
                        (err: any, res: any) => {
            if (err) {
                throw err;
            }
        });
    }

    private mapUserRowToUser(userRow: any): User {
        return {
            id: userRow['id'],
            dateCreated: userRow['date_created'] as Date,
            email: userRow['email'],
            password: userRow['password'],
            salt: userRow['salt'],
            firstName: userRow['first_name'],
            lastName: userRow['last_name'],
            birthdate: userRow['birthdate'] as Date,
            livingIn: userRow['living_in'],
            education: userRow['education'],
            workingAt: userRow['working_at'],
            hobby: userRow['hobby']
        }
    }
}

export default UserService;