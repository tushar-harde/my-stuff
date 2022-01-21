require('dotenv').config();
import express from "express";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import logger from "morgan";
// var express = require('express');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
var auth = require('./lib/auth');

import auth from "@lib/auth";

var indexRouter = require('./routes/index-route');
var usersRouter = require('./routes/users-route');
var authRouter = require('./routes/auth-route');
var tokenRouter = require("./routes/token-route");
var testRouter = require('./routes/test-route');

require('./lib/db-connection');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(auth.isUserAuthorized);

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', usersRouter);
app.use('/api/token', tokenRouter);
app.use('/api/test', testRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message
  });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Workout app listening at http://localhost:${process.env.SERVER_PORT}`)
});

module.exports = app;
