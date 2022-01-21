var express = require('express');
var router = express.Router();
var db = require('../lib/db-connection');

router.get('/', (req, res, next) => {
  db.test("test", { a: 123 }, Object, (error, response) => {
    res.send(response);
  });
});

module.exports = router;
