// 加载环境变量
require("dotenv").config();

// 初始化数据库连接
require("./db/database");

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
// {{ AURA-X: Modify - 修复CORS安全配置. Approved: 安全修复. }}
app.use(
  cors({
    // {{ AURA-X: Modify - 添加IPv4地址到CORS允许列表. Approved: 网络配置修复. }}
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "http://198.18.0.1:3000",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

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
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "聊天服务器运行正常",
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
