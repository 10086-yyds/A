let mongoose = require("./database");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  lastLoginTime: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}); //用户表

let userModel = mongoose.model("user", userSchema, "user");

let articleSchema = new mongoose.Schema({}); //文章表

let articleModel = mongoose.model("article", articleSchema, "article");

let caseSchema = new mongoose.Schema({}); //病例表

let caseModel = mongoose.model("case", caseSchema, "case");

let drugSchema = new mongoose.Schema({
  image: String,
  name: String,
  price: Number,
  tag: {
    type: String,
    default: ''
  },
}); //药品表

let drugModel = mongoose.model("drug", drugSchema, "drug");

let videoSchema = new mongoose.Schema({}); //视频表

let videoModel = mongoose.model("video", videoSchema, "video");

let orderSchema = new mongoose.Schema({}); //药品订单表

let orderModel = mongoose.model("order", orderSchema, "order");

let consultationSchema = new mongoose.Schema({}); //问诊订单表

let consultationModel = mongoose.model(
  "consultation",
  consultationSchema,
  "consultation"
);

module.exports = {
  userModel,
  articleModel,
  caseModel,
  drugModel,
  videoModel,
  orderModel,
  consultationModel,
};
