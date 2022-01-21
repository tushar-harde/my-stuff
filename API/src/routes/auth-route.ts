import { AuthHelper } from "@lib/auth";

var express = require('express');
var router = express.Router();

const auth = new AuthHelper();

router.post('/sign-in', (req, res, next) => {    
    auth.sdbUserSignIn(req.body.username, req.body.password, (error, tokens) => {
        if (!error) {
            res.send(tokens);
        } else {
            next({
                message: error.message,
                status: error.status || 500
            });
        }
    });
});

router.post('/google-sign-in', (req, res, next) => {
    const idToken = typeof req.body.idToken === 'string' && req.body.idToken.length > 0 ? req.body.idToken : false;
    if (idToken) {
        auth.signInWithGoogle(idToken, (error, payload) => {
            if (!error) {
                res.send(payload);
            } else {
                next(error);
            }
        });
    } else {
        next({
            message: `Missing required parameter idToken`,
            status: 400
        });
    }
});

router.post('/facebook-sign-in', (req, res, next) => {    
    const idToken = typeof req.body.idToken === 'string' && req.body.idToken.length > 0 ? req.body.idToken : false;
    if (idToken) {
        auth.signInWithFacebook(idToken, (error, payload) => {
            if (!error) {
                res.send(payload);
            } else {
                next(error);
            }
        });
    } else {
        next({
            message: `Missing required parameter idToken`,
            status: 400
        });
    }
});

router.get('/sign-out', (req, res, next) => {
    const userID = req.auth.sub;
    auth.signOut(userID, (error, response) => {
        if (!error) {
            res.send(response);
        } else {
            next(error);
        }
    });
});

module.exports = router;