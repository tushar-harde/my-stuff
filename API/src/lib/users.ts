// const db = require('./db-connection');
// const User = require('../model/user-model');
// const auth = require('./auth');

import { ErrorResponse } from "@model/error.model";
import { AppRequest } from "@model/global.model";
import { User } from "@model/user.model";
import { NextFunction, Response } from "express";
import { AuthHelper } from "./auth";
import { Database } from "./db-connection";

export class UserHelper {
    constructor(private db: Database, private auth: AuthHelper) {};

    async validateUserInfo(req: AppRequest, res: Response, next: NextFunction) {
        var userInfo = req.body;
        var email =
            typeof userInfo.email === "string" && userInfo.email.trim().length > 0
            ? userInfo.email
            : false;
        var name =
            typeof userInfo.name === "string" && userInfo.name.trim().length > 0
            ? userInfo.name
            : false;
        var phone =
            typeof userInfo.phone === "string" && userInfo.phone.trim().length > 0
            ? userInfo.phone
            : false;
        var password =
            typeof userInfo.password === "string" && userInfo.password.trim().length > 0
            ? userInfo.password
            : false;
        var gender =
            typeof userInfo.gender === "string" && userInfo.gender.trim().length > 0
            ? userInfo.gender
            : false;
    
        if (email && name && phone && password && gender) {        
            try {
                req.body.originalPassword = await req.body.password;
                req.body.password = await auth.createPasswordHash(password);
                next();
            } catch (error) {
                next({
                    message: error.message,
                    status: 500
                });
            }                 
        } else {
            next({
                message: `Missing parameter ${!email ? 'email' : ''} ${!name ? 'name' : ''} ${!phone ? 'phone' : ''} ${!password ? 'password' : ''} ${!gender ? 'gender' : ''}.`,
                status: 400
            });
        }
    }

    sdbUserAdd(user: User, callback: (error: ErrorResponse, result?: any) => void) {
        const originalPassword = user.originalPassword as string;
        delete user.originalPassword;
        // create user
        this.db.executeProc("sdbUserAdd", user, User, async (error, result: User) => {
            if (!error.isError) {
                try {
                    // sign in user
                    this.auth.sdbUserSignIn(user.email || user.phone, originalPassword, (err, tokens) => {
                        if (!err.isError) {
                            callback({ isError: false }, tokens);
                        } else {
                            callback(err);
                        }
                    });
                } catch (error) {
                    callback({
                        message: error.message,
                        isError: true
                    });
                }
            } else {
                callback(error);
            }
        });
    }
}

// const userHelper = {};

// validate fields user and encrypt user password
// userHelper.validateUserInfo = async (req, res, next) => {
//     var userInfo = req.body;
//     var email =
//         typeof userInfo.email === "string" && userInfo.email.trim().length > 0
//         ? userInfo.email
//         : false;
//     var name =
//         typeof userInfo.name === "string" && userInfo.name.trim().length > 0
//         ? userInfo.name
//         : false;
//     var phone =
//         typeof userInfo.phone === "string" && userInfo.phone.trim().length > 0
//         ? userInfo.phone
//         : false;
//     var password =
//         typeof userInfo.password === "string" && userInfo.password.trim().length > 0
//         ? userInfo.password
//         : false;
//     var gender =
//         typeof userInfo.gender === "string" && userInfo.gender.trim().length > 0
//         ? userInfo.gender
//         : false;

//     if (email && name && phone && password && gender) {        
//         try {
//             req.body.originalPassword = await req.body.password;
//             req.body.password = await auth.createPasswordHash(password);
//             next();
//         } catch (error) {
//             next({
//                 message: error.message,
//                 status: 500
//             });
//         }                 
//     } else {
//         next({
//             message: `Missing parameter ${!email ? 'email' : ''} ${!name ? 'name' : ''} ${!phone ? 'phone' : ''} ${!password ? 'password' : ''} ${!gender ? 'gender' : ''}.`,
//             status: 400
//         });
//     }
// }

// userHelper.sdbUserAdd = (user, callback) => {
//     const originalPassword = user.originalPassword;
//     delete user.originalPassword;
//     // create user
//     db.executeProc("sdbUserAdd", user, User, async (error, result) => {
//         if (!error) {
//             try {
//                 // sign in user
//                 auth.sdbUserSignIn(user.email || user.phone, originalPassword, (err, tokens) => {
//                     if (!err) {
//                         callback(false, tokens);
//                     } else {
//                         callback(err);
//                     }
//                 });
//             } catch (error) {
//                 callback(error);
//             }
//         } else {
//             callback({
//                 message: error.message,
//                 status: 400
//             });
//         }
//     });
// }

// module.exports = userHelper;