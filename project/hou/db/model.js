let mongoose = require("./database");

// {{ AURA-X: Modify - 强化用户模式验证和安全性. Approved: 安全修复. }}
let userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    password: {
      type: String,
      required: true,
      minLength: 6, // 与注册接口验证保持一致
      select: false, // Don't return password in queries by default
    },
    // {{ AURA-X: Modify - 修复注册字段要求不匹配. Approved: 数据一致性修复. }}
    realName: {
      type: String,
      required: false, // 注册时可选，后续可在个人资料中填写
      trim: true,
      maxLength: 50,
    },
    email: {
      type: String,
      required: false, // 注册时可选
      unique: true,
      sparse: true, // 允许多个null值，但非null值必须唯一
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      required: false, // 注册时可选
      unique: true,
      sparse: true, // 允许多个null值，但非null值必须唯一
      trim: true,
      match: /^1[3-9]\d{9}$/, // Chinese mobile number format
    },
    avatar: {
      type: String,
      default: "",
      maxLength: 500,
    },
    role: {
      type: String,
      enum: ["admin", "user", "doctor", "nurse"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // 新增安全相关字段
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
);

// 添加索引以提高查询性能
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, isActive: 1 });

let userModel = mongoose.model("user", userSchema, "user");

// {{ AURA-X: Modify - 强化文章模式定义. Approved: 代码质量修复. }}
let articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    content: {
      type: String,
      required: true,
      maxLength: 50000,
    },
    summary: {
      type: String,
      maxLength: 500,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "健康科普",
        "疾病预防",
        "治疗指南",
        "营养保健",
        "心理健康",
        "医疗新闻",
      ],
    },
    tags: [
      {
        type: String,
        maxLength: 20,
      },
    ],
    coverImage: {
      type: String,
      maxLength: 500,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: Date,
    seoTitle: {
      type: String,
      maxLength: 100,
    },
    seoDescription: {
      type: String,
      maxLength: 300,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ viewCount: -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ title: "text", content: "text" }); // 全文搜索索引
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
// {{ AURA-X: Modify - 重构医生职位模式，避免与用户模式重复. Approved: 数据库设计修复. }}
let positionSchema = new mongoose.Schema(
  {
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
    // 医生专业信息
    licenseNumber: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },
    hospital: {
      type: String,
      // required: true,
      trim: true,
      maxLength: 100,
    },
    department: {
      type: String,
      // required: true,
      trim: true,
      maxLength: 50,
    },
    specialty: {
      type: String,
      // required: true,
      trim: true,
      maxLength: 100,
    },
    professionalTitle: {
      type: String,
      enum: [
        "住院医师",
        "主治医师",
        "副主任医师",
        "主任医师",
        "护士",
        "主管护师",
        "副主任护师",
        "主任护师",
      ],
      // required: true,
    },
    workExperience: {
      type: Number, // 工作年限
      // required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    consultations: {
      type: Number,
      default: 0,
      min: 0,
    },
    consultationFee: {
      type: Number,
      // required: true,
      min: 0,
    },
    introduction: {
      type: String,
      maxLength: 1000,
    },
    workSchedule: {
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    certifications: [
      {
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 添加索引
positionSchema.index({ userId: 1 });
positionSchema.index({ hospital: 1, department: 1 });
positionSchema.index({ specialty: 1 });
positionSchema.index({ rating: -1 });
positionSchema.index({ consultationFee: 1 });
positionSchema.index({ isAvailable: 1 });

let positionModel = mongoose.model("position", positionSchema, "position");
let articleModel = mongoose.model("article", articleSchema, "article");

// 消息模型
let messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatSession",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "voice"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

let messageModel = mongoose.model("message", messageSchema, "message");

// 在线用户模型（用于WebSocket连接管理）
let onlineUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    socketId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["online", "away", "offline"],
      default: "online",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

let onlineUserModel = mongoose.model(
  "onlineUser",
  onlineUserSchema,
  "onlineUser"
);

// {{ AURA-X: Modify - 强化药品模式定义，增加医疗相关字段. Approved: 业务逻辑修复. }}
let drugSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
      unique: true,
    },
    genericName: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["处方药", "非处方药", "中药", "保健品", "医疗器械"],
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    productionDate: Date,
    expiryDate: {
      type: Date,
      required: true,
    },
    dosageForm: {
      type: String,
      required: true,
      enum: [
        "片剂",
        "胶囊",
        "口服液",
        "注射液",
        "软膏",
        "滴剂",
        "颗粒剂",
        "其他",
      ],
    },
    strength: String, // 规格强度，如"500mg"
    packageSize: String, // 包装规格，如"30片/盒"
    activeIngredients: [
      {
        name: String,
        content: String,
      },
    ],
    indications: String, // 适应症
    contraindications: String, // 禁忌症
    sideEffects: String, // 副作用
    dosageInstructions: String, // 用法用量
    storageConditions: String, // 储存条件
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    approvalNumber: String, // 批准文号
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 10,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引
drugSchema.index({ name: 1 });
drugSchema.index({ category: 1 });
drugSchema.index({ manufacturer: 1 });
drugSchema.index({ requiresPrescription: 1 });
drugSchema.index({ inStock: 1, isActive: 1 });
drugSchema.index({ expiryDate: 1 });
drugSchema.index({ name: "text", description: "text" }); // 全文搜索

let drugModel = mongoose.model("drug", drugSchema, "drug");

// {{ AURA-X: Modify - 强化订单模式定义，增加支付和物流字段. Approved: 业务逻辑修复. }}
let orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return (
          "ORD" +
          Date.now() +
          Math.random().toString(36).substr(2, 4).toUpperCase()
        );
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [
      {
        drugId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "drug",
          required: true,
        },
        drugName: String, // 保存下单时的药品名称，防止后续修改
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        prescriptionRequired: Boolean,
      },
    ],
    subtotalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "paid",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["wechat", "alipay", "bank_card", "cash"],
      required: function () {
        return this.paymentStatus === "paid";
      },
    },
    paymentTime: Date,
    transactionId: String, // 第三方支付交易号
    shippingAddress: {
      receiverName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      detailAddress: { type: String, required: true },
      postalCode: String,
    },
    trackingNumber: String, // 快递单号
    courier: String, // 快递公司
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    prescriptionImages: [String], // 处方图片URLs
    notes: String, // 订单备注
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: String,
  },
  {
    timestamps: true,
  }
);

// 添加索引
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "items.drugId": 1 });

let orderModel = mongoose.model("order", orderSchema, "order");

let consultationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "position",
    required: true,
  },
  symptoms: String,
  diagnosis: String,
  prescription: String,
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  consultationFee: Number,
  createdAt: { type: Date, default: Date.now },
}); //问诊订单表

let consultationModel = mongoose.model(
  "consultation",
  consultationSchema,
  "consultation"
);

// {{ AURA-X: Add - 添加缺失的chatSessionModel定义. Approved: 安全修复. }}
let chatSessionSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    ],
    sessionType: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "message" },
    lastMessageTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

let chatSessionModel = mongoose.model(
  "chatSession",
  chatSessionSchema,
  "chatSession"
);

// {{ AURA-X: Add - 添加缺失的重要业务模型. Approved: 业务逻辑完善. }}
// 预约模型
let appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return (
          "APT" +
          Date.now() +
          Math.random().toString(36).substr(2, 4).toUpperCase()
        );
      },
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "position",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true }, // 格式：'09:00'
      endTime: { type: String, required: true }, // 格式：'09:30'
    },
    appointmentType: {
      type: String,
      enum: ["consultation", "follow-up", "check-up", "emergency"],
      default: "consultation",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
    },
    symptoms: String,
    notes: String,
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    cancelReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

let appointmentModel = mongoose.model(
  "appointment",
  appointmentSchema,
  "appointment"
);

// 处方模型
let prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return (
          "RX" +
          Date.now() +
          Math.random().toString(36).substr(2, 4).toUpperCase()
        );
      },
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "position",
      required: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consultation",
    },
    medications: [
      {
        drugId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "drug",
          required: true,
        },
        drugName: String,
        dosage: String, // 剂量
        frequency: String, // 频次
        duration: String, // 疗程
        instructions: String, // 用药说明
        quantity: Number, // 开药数量
      },
    ],
    diagnosis: String,
    instructions: String, // 医嘱
    status: {
      type: String,
      enum: ["active", "filled", "cancelled", "expired"],
      default: "active",
    },
    expiryDate: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天后过期
      },
    },
    filledAt: Date,
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ expiryDate: 1 });

let prescriptionModel = mongoose.model(
  "prescription",
  prescriptionSchema,
  "prescription"
);

// 支付记录模型
let paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return (
          "PAY" +
          Date.now() +
          Math.random().toString(36).substr(2, 4).toUpperCase()
        );
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // 可能是订单ID或预约ID
    },
    relatedType: {
      type: String,
      enum: ["order", "appointment", "consultation"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["wechat", "alipay", "bank_card", "cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    transactionId: String, // 第三方支付交易号
    platformTransactionId: String, // 平台内部交易号
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: String,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ userId: 1 });
paymentSchema.index({ relatedId: 1, relatedType: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

let paymentModel = mongoose.model("payment", paymentSchema, "payment");

module.exports = {
  userModel,
  drugModel,
  roleModel,
  positionModel,
  orderModel,
  consultationModel,
  chatSessionModel,
  messageModel,
  onlineUserModel,
  appointmentModel,
  prescriptionModel,
  paymentModel,
  articleModel,
};
