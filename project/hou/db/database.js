let mongoose = require("mongoose");
const config = require("../config/config");

mongoose
  .connect(config.mongodb.uri)
  .then(() => {
    console.log("Connected to MongoDB,连接成功");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
