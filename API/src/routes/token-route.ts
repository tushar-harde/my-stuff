var express = require('express');
var router = express.Router();
var token = require('../lib/token');

router.post('/refreshAccessToken', (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
        token.refreshAccessToken(refreshToken)
            .then((token) => {
                res.send(token);
            })
            .catch(error => {
                next(error);
            });
    } else {
        next({
            message: "Missing required field. refreshToken.",
            status: 400
        });
    }
});

module.exports = router;
