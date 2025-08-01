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
  key:{
    type:String,
    default:''
  },
  shelf:{
    type:Boolean,
    default:false
  }
}); //药品表

let drugModel = mongoose.model("drug", drugSchema, "drug");

let videoSchema = new mongoose.Schema({}); //视频表

let videoModel = mongoose.model("video", videoSchema, "video");



const generateOrderNumber = () => {
  // 固定前缀DD + 10位随机字母数字组合
  const prefix = 'DD';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  
  for (let i = 0; i < 10; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix + randomStr;
};


const generatePhoneNumber = () => {
  const first = '1';
  const second = Math.floor(Math.random() * 7) + 3; // 3-9之间的数字
  let rest = '';
  
  for (let i = 0; i < 9; i++) {
    rest += Math.floor(Math.random() * 10);
  }
  
  return first + second + rest;
};


let orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true, 
    default: generateOrderNumber // 自动生成订单编号
  },
  phoneNumber: {
    type: String,
    default: generatePhoneNumber // 自动生成电话号码
  },
  illName:{
    type:String,
    default:"张三"  //患者姓名
  },
  orderPrice:String, // 订单金额
  orderTime:{ //付款时间
    type:Date,
    default:Date.now
  },
  orderStatus:{ // 订单状态
    type:Boolean,
    default:false
  },
  address:{
    type:String,
    default:"陕西省西安市莲湖区东华门街道158号世纪博苑三期南区12-3-1601室"
  }
});

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
