let mongoose = require("mongoose");
const config = require("../config/config");

mongoose
  .connect(config.mongodb.uri)
  .then(() => {
    console.log("✅ 成功连接到MongoDB数据库");
    console.log(
      "数据库连接地址:",
      config.mongodb.uri.replace(/\/\/.*@/, "//***:***@")
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB连接失败:");
    console.error("错误详情:", err.message);
    console.error(
      "连接地址:",
      config.mongodb.uri.replace(/\/\/.*@/, "//***:***@")
    );
    // 不退出进程，让服务器继续运行
  });

module.exports = mongoose;
