let mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://2732849023:kV2y2TU4cYPq6Y9C@cluster0.plvxg2d.mongodb.net/medical",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5秒服务器选择超时
      socketTimeoutMS: 45000, // 45秒socket超时
      connectTimeoutMS: 10000, // 10秒连接超时
      maxPoolSize: 10, // 连接池大小
      retryWrites: true,
      w: "majority"
    }
  )
  .then(() => {
    console.log("数据库连接成功");
  })
  .catch((err) => {
    console.log("数据库连接失败", err.message);
    console.log("请检查网络连接或MongoDB Atlas配置");
  });

module.exports = mongoose;
