let mongoose = require("mongoose");
const config = require("../config/config");

mongoose
  .connect(config.mongodb.uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
