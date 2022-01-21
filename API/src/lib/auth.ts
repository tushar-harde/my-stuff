// var token = require('./token');
// var url = require('url');
// const bcrypt = require('bcryptjs');
// const db = require('./db-connection');
// const User = require('../model/user-model');
// const googleAuth = require('./google-auth');
// const facebookAuth = require('./facebook-auth');

import bcrypt from "bcryptjs";
import url from "url";
import { Database } from "./db-connection";
import { Response, NextFunction } from "express";
import { User } from "@model/user.model";
import { ErrorResponse } from "@model/error.model";
import { FacebookAuth } from "./facebook-auth";
import { GoogleAuth } from "./google-auth";
import { AppRequest } from "@model/global.model";

export class AuthHelper {
    private skipRoutePathFromAuth =   [
        "api/user/register",
        "api/auth/sign-in",
        "api/auth/google-sign-in",
        "api/auth/facebook-sign-in",
        "api/token/refreshAccessToken"
    ];
    hashsalt = process.env.HASHSALT ? +process.env.HASHSALT : 10;
    constructor(private db: Database, private facebookAuth: FacebookAuth, private googleAuth: GoogleAuth) {}

    private comparePassword (password: string, hashPassword: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const match = await bcrypt.compare(password, hashPassword);
                if (match) {
                    resolve(password);
                } else {
                    throw new Error('Password does not match.');
                }
            } catch (error) {
                reject({
                    message: error.message,
                    status: 400
                });
            }
        });
    }

    private async createAccessTokens (userID: number, userName: string, callback: (error: ErrorResponse, result?: any) => void) {
        try {
            if (+userID > 0 && userName.length > 0) {
                const tokenObject: {[k: string]: any} = {};
                tokenObject.userID = userID;
                tokenObject.refreshToken = await token.createRefreshToken({ sub: userID, name: userName });
                this.db.executeProc("sdbUserRefreshTokenAdd", tokenObject, Object, async (error, response) => {
                    if (!error) {
                        tokenObject.accessToken = await token.createAccessToken({ sub: userID, name: userName });
                        await delete tokenObject.userID;
                        callback({ isError: false }, tokenObject);
                    } else {
                        callback(error);
                    }
                });
            } else {
                callback({
                    message: 'Missing userID or userName',
                    isError: true
                });
            }
        } catch (error) {
            callback(error)
        }
    }

    async isUserAuthorized(req: AppRequest, res: Response, next: NextFunction) {
        res.setHeader("Content-Type", "application/json");
        const requrl: string = req.url || "";
        const parseUrl = await url.parse(requrl, true).pathname!.replace(/^\/+|\/+$/g, "") as string;
        const skipAuth = await this.skipRoutePathFromAuth.findIndex(e => e == parseUrl);
    
        // Authorize if path not found
        if (skipAuth < 0) {
            const accessToken = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]
                                    ? req.headers['authorization'].split(' ')[1]
                                    : false;
            if (accessToken) {
                req.auth = await token.verifyAccessToken(accessToken).catch(() => next({
                    message: 'Invalid access token.',
                    status: 403
                }));
                next();
            } else {
                next({
                    message: 'Acceess denied.',
                    status: 403
                });
            }
        } else {
            next();
        }
    }

    createPasswordHash(password: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const salt = await bcrypt.genSalt(+this.hashsalt)
                const hash = await bcrypt.hash(password, salt);
                resolve(hash);
            } catch (error) {
                reject(error);
            }
        });
    }

    sdbUserSignIn(username: string, password: string, callback: (error: ErrorResponse, result?: any) => void) {
        if (username.length > 0 && password.length > 0) {
            this.db.executeProc("sdbUserSignIn", { username }, User, async (error: ErrorResponse, result?: any) => {
                if (!error.isError) {
                    try {
                        const match = await this.comparePassword(password, result.password);                
                        this.createAccessTokens(result.userID, result.name, (error, tokens) => {
                            if (!error.isError) {
                                callback({ isError: true }, tokens);
                            } else {
                                callback(error);
                            }
                        });
                    } catch (error) {
                        callback({
                            message: error.message,
                            isError: true
                        });
                    }
                } else {
                    callback({
                        message: error.message,
                        status: 400,
                        isError: true
                    });
                }          
            });
        } else {
            callback({
                message: 'Missing required fields.',
                status: 400,
                isError: true
            });
        }
    }

    signInWithGoogle(idToken: string, callback: (error: ErrorResponse, result?: any) => void) {
        this.googleAuth.verify(idToken).then(userProfile => {
            db.executeProc("sdbSignInWithGoogle", userProfile, User, (error: ErrorResponse, user: User) => {            
                if (!error.isError && user.userID && user.name) {
                    this.createAccessTokens(user.userID, user.name, (error, token) => {
                        if (!error.isError) {
                            callback({ isError: false }, token);
                        } else {
                            callback(error);
                        }
                    });
                } else {
                    callback(error || new Error('Missing userID or userName'));
                }
            });
        }).catch(error => {
            callback({
                message: error.message,
                status: 400,
                isError: true
            });
        });
    }

    signInWithFacebook(idToken: string, callback: (error: ErrorResponse, result?: any) => void) {
        this.facebookAuth.verify(idToken).then(userProfile => {
            db.executeProc("sdbSignInWithFacebook", userProfile, User, (error: ErrorResponse, user: User) => {            
                if (!error.isError && user.userID && user.name) {
                    this.createAccessTokens(user.userID, user.name, (error, token) => {
                        if (!error) {
                            callback({ isError: false }, token);
                        } else {
                            callback(error);
                        }
                    });
                } else {
                    callback(error || new Error('Missing userID or userName'));
                }
            });
        }).catch(error => {
            callback({
                message: error.message,
                status: error.status || 400,
                isError: true
            });
        });
    }

    signOut(userID: number, callback: (error: ErrorResponse, result?: any) => void) {
        db.executeProc("sdbUserSignOut", { userID }, Object, (error: ErrorResponse, response: any) => {
            if (!error.isError) {
                callback({isError: true}, "Sign out successfull.");
            } else {
                callback(error);
            }
        });
    }
}

// const skipRoutePathFromAuth =   [
//                                     "api/user/register",
//                                     "api/auth/sign-in",
//                                     "api/auth/google-sign-in",
//                                     "api/auth/facebook-sign-in",
//                                     "api/token/refreshAccessToken"
//                                 ];

// const comparePassword = (password, hashPassword) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const match = await bcrypt.compare(password, hashPassword);
//             if (match) {
//                 resolve(password);
//             } else {
//                 throw new Error('Password does not match.');
//             }
//         } catch (error) {
//             reject({
//                 message: error.message,
//                 status: 400
//             });
//         }
//     });
// }

/**
 * @param {*} callback error and token
 */
// const createAccessTokens = async (userID, userName, callback) => {
//     try {
//         userID = Number(userID) !== NaN && Number(userID) > 0 ? userID : false;
//         userName = typeof userName === "string" && userName.trim().length > 0 ? userName : false;
//         if (userID && userName) {
//             const tokenObject = {};
//             tokenObject.userID = userID;                
//             tokenObject.refreshToken = await token.createRefreshToken({ sub: userID, name: userName });
//             db.executeProc("sdbUserRefreshTokenAdd", tokenObject, Object, async (error, response) => {
//                 if (!error) {
//                     tokenObject.accessToken = await token.createAccessToken({ sub: userID, name: userName });
//                     await delete tokenObject.userID;
//                     callback(false, tokenObject);
//                 } else {
//                     callback(error);
//                 }
//             });
//         } else {
//             callback('Missing userID or userName');
//         }
//     } catch (error) {
//         callback(error)
//     }
// }

// const auth = {};

// auth.isUserAuthorized = async (req, res, next) => {
//     res.setHeader("Content-Type", "application/json");
//     const parseUrl = await url.parse(req.url, true).pathname.replace(/^\/+|\/+$/g, "");
//     const skipAuth = await skipRoutePathFromAuth.findIndex(e => e == parseUrl);

//     // Authorize if path not found
//     if (skipAuth < 0) {
//         const accessToken = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]
//                                 ? req.headers['authorization'].split(' ')[1]
//                                 : false;
//         if (accessToken) {
//             req.auth = await token.verifyAccessToken(accessToken).catch(error => next({
//                 message: 'Invalid access token.',
//                 status: 403
//             }));
//             next();
//         } else {
//             next({
//                 message: 'Acceess denied.',
//                 status: 403
//             });
//         }
//     } else {
//         next();
//     }
// }

// auth.createPasswordHash = (password) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const salt = await bcrypt.genSalt(+process.env.HASHSALT)
//             const hash = await bcrypt.hash(password, salt);
//             resolve(hash);
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

/**
 * @param {*} callback error and token
 */
// auth.sdbUserSignIn = (username, password, callback) => {
//     username = typeof username === "string" && username.trim().length > 0 ? username : false;
//     password = typeof password === "string" && password.trim().length > 0 ? password : false;
//     if (username && password) {
//         db.executeProc("sdbUserSignIn", { username }, User, async (error, result) => {
//             if (!error) {
//                 try {
//                     const match = await comparePassword(password, result.password);                
//                     createAccessTokens(result.userID, result.name, (error, tokens) => {
//                         if (!error) {
//                             callback(false, tokens);
//                         } else {
//                             callback(error);
//                         }
//                     });
//                 } catch (error) {
//                     callback(error);
//                 }
//             } else {
//                 callback({
//                     message: error.message,
//                     status: 400
//                 });
//             }          
//         });
//     } else {
//         callback({
//             message: 'Missing required fields.',
//             status: 400
//         });
//     }
// }

// auth.signInWithGoogle = (idToken, callback) => {
//     googleAuth.verify(idToken).then(userProfile => {
//         db.executeProc("sdbSignInWithGoogle", userProfile, User, (error, user) => {            
//             if (!error && user.userID && user.name) {
//                 createAccessTokens(user.userID, user.name, (error, token) => {
//                     if (!error) {
//                         callback(false, token);
//                     } else {
//                         callback(error);
//                     }
//                 });
//             } else {
//                 callback(error || new Error('Missing userID or userName'));
//             }
//         });
//     }).catch(error => {
//         callback({
//             message: error.message,
//             status: 400
//         });
//     });
// }

// auth.signInWithFacebook = (idToken, callback) => {
//     facebookAuth.verify(idToken).then(userProfile => {
//         db.executeProc("sdbSignInWithFacebook", userProfile, User, (error, user) => {            
//             if (!error && user.userID && user.name) {
//                 createAccessTokens(user.userID, user.name, (error, token) => {
//                     if (!error) {
//                         callback(false, token);
//                     } else {
//                         callback(error);
//                     }
//                 });
//             } else {
//                 callback(error || new Error('Missing userID or userName'));
//             }
//         });
//     }).catch(error => {
//         callback({
//             message: error.message,
//             status: error.status || 400
//         });
//     });
// }

// auth.signOut = (userID, callback) => {
//     db.executeProc("sdbUserSignOut", { userID }, Object, (error, response) => {
//         if (!error) {
//             callback(false, "Sign out successfull.");
//         } else {
//             callback(error);
//         }
//     });
// }