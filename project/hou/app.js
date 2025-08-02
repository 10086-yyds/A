// 加载环境变量
require('dotenv').config();

// 初始化数据库连接
require('./db/database');

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var lzRouter = require("./routes/lz");
var jbhRouter = require("./routes/jbh");
var wxyRouter = require("./routes/wxy");
var zjfRouter = require("./routes/zjf");
var chatRouter = require("./routes/chat");

var app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/lz", lzRouter);
app.use("/jbh", jbhRouter);
app.use("/wxy", wxyRouter);
app.use("/zjf", zjfRouter);
app.use("/api/chat", chatRouter);

// 聊天相关的API路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: '聊天服务器运行正常'
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
