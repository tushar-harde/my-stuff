var express = require('express');
var user = require('../lib/users');
var router = express.Router();

router.get('/', (req, res, next) => {
  console.log(req.headers["user-agent"]);
  res.send(req.auth);
});

router.post('/register', user.validateUserInfo, (req, res, next) => {
  user.sdbUserAdd(req.body, (error, result) => {
    if (!error) {
      res.send(result);
    } else {
      next({
        message: error.message,
        status: error.status || 500
      });
    }
  });
});

module.exports = router;
