let mongoose = require("./database");

let userSchema = new mongoose.Schema({}); //用户表

let userModel = mongoose.model("user", userSchema, "user");

let articleSchema = new mongoose.Schema({
  title:String,
  content:String,
  browse:String,
  cate:Number
}); //文章表
let roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, //角色名称
  permission: {
    type: Array,
    required: true,
  }, //权限
});

let roleModel = mongoose.model("role", roleSchema, "role");
let positionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  realName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  roleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "role",
  },
  hospital:String,
  specialty:String,
  rating:Number,
  consultations:Number,
  title:String,
  avatar:String
});

let positionModel = mongoose.model("position", positionSchema, "position");
let articleModel = mongoose.model("article", articleSchema, "article");

let caseSchema = new mongoose.Schema({}); //病例表

let caseModel = mongoose.model("case", caseSchema, "case");

let drugSchema = new mongoose.Schema({}); //药品表

let drugModel = mongoose.model("drug", drugSchema, "drug");

let videoSchema = new mongoose.Schema({}); //视频表

let videoModel = mongoose.model("video", videoSchema, "video");

let orderSchema = new mongoose.Schema({}); //药品订单表

let orderModel = mongoose.model("order", orderSchema, "order");

let consultationSchema = new mongoose.Schema({}); //问诊订单表

let consultationModel = mongoose.model("consultation",consultationSchema,"consultation");

module.exports = {
  userModel,
  articleModel,
  caseModel,
  drugModel,
  videoModel,
  orderModel,
  consultationModel,
  positionModel,
  roleModel,
};
