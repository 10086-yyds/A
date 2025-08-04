var express = require("express");
var router = express.Router();
// {{ AURA-X: Add - 添加bcrypt用于密码加密. Approved: 安全修复. }}
const bcrypt = require("bcrypt");

let {
  positionModel,
  roleModel,
  userModel,
  orderModel,
  drugModel,
} = require("../../db/model");

// 导入权限验证中间件
const {
  checkPermission,
  checkMultiplePermissions,
  checkAnyPermission,
} = require("../../middleware/auth");

router.post("/login", async function (req, res) {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.json({ code: 400, msg: "用户名和密码不能为空" });
    }

    // 查找用户并关联角色信息，同时获取密码字段
    let user = await positionModel
      .findOne({ username })
      .populate("roleID")
      .select("+password");
    if (!user) {
      return res.json({ code: 400, msg: "用户不存在" });
    }

    // 验证密码 - 由于数据库中存储的是明文密码，直接比较
    if (!user.password) {
      return res.json({ code: 400, msg: "用户密码数据异常" });
    }

    // 直接比较明文密码
    if (password !== user.password) {
      return res.json({ code: 400, msg: "密码错误" });
    }

    // 更新最后登录时间
    user.lastSeen = new Date();
    await user.save();

    // 登录成功，返回用户信息
    const userData = {
      id: user._id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      role: user.roleID,
      permissions: user.roleID?.permission || [], // 添加权限信息
      token: "mock-token-" + Date.now(), // 这里应该生成真实的JWT token
    };

    return res.json({
      code: 200,
      msg: "登录成功",
      data: userData,
    });
  } catch (error) {
    console.error("登录错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

// 创建角色 - 需要 "create_role" 权限
router.post(
  "/create",
  checkPermission("create_role"),
  async function (req, res) {
    try {
      let { role, permission } = req.body;

      // 验证必需字段
      if (!role) {
        return res.json({ code: 400, msg: "角色名称不能为空" });
      }

      const roleData = await roleModel.findOne({ name: role });
      if (roleData) {
        return res.json({ code: 400, msg: "角色已存在" });
      } else {
        // 将role字段映射到name字段
        const newRoleData = await roleModel.create({
          name: role,
          permission: permission || [],
        });
        return res.json({ code: 200, msg: "创建成功", data: newRoleData });
      }
    } catch (error) {
      console.error("创建角色错误:", error);
      return res.json({ code: 500, msg: "服务器错误" });
    }
  }
);

// 添加用户 - 需要 "create_user" 权限
router.post("/add", checkPermission("create_user"), async function (req, res) {
  try {
    let { username, password, realName, email, phone, roleID } = req.body;

    if (!username || !password || !realName || !email || !phone) {
      return res.json({ code: 400, msg: "所有字段都是必需的" });
    }

    // {{ AURA-X: Modify - 密码加密存储. Approved: 安全修复. }}
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let positionData = await positionModel.create({
      username,
      password: hashedPassword,
      realName,
      email,
      phone,
      roleID,
    });
    return res.json({ code: 200, msg: "创建成功", data: positionData });
  } catch (error) {
    console.error("添加用户错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

// 删除用户 - 需要 "delete_user" 权限
router.post(
  "/delete",
  checkPermission("delete_user"),
  async function (req, res) {
    try {
      let { id } = req.body;

      if (!id) {
        return res.json({ code: 400, msg: "用户ID不能为空" });
      }

      let positionData = await positionModel.findByIdAndDelete(id);
      if (!positionData) {
        return res.json({ code: 400, msg: "用户不存在" });
      }
      return res.json({ code: 200, msg: "删除成功", data: positionData });
    } catch (error) {
      console.error("删除用户错误:", error);
      return res.json({ code: 500, msg: "服务器错误" });
    }
  }
);

// 获取用户列表 - 需要 "view_users" 权限
router.get("/list", checkPermission("view_users"), async function (req, res) {
  try {
    let { page = 1, pageSize = 10 } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    let list = await userModel
      .find({})
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    let total = await userModel.countDocuments();
    return res.json({ code: 200, msg: "获取成功", data: list, total });
  } catch (error) {
    console.error("获取用户列表错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

router.get("/roleList", async function (req, res) {
  try {
    let list = await roleModel.find({});
    return res.json({ code: 200, msg: "获取成功", data: list });
  } catch (error) {
    console.error("获取角色列表错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

router.get("/positionList", async function (req, res) {
  try {
    let data = await positionModel.find({}).populate("roleID");
    return res.json({ code: 200, msg: "获取成功", data });
  } catch (error) {
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

router.get("/orderList", async function (req, res) {
  try {
    let { page = 1, pageSize = 10 } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    let list = await orderModel
      .find({})
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    let total = await orderModel.countDocuments();
    return res.json({ code: 200, msg: "获取成功", data: list, total });
  } catch (error) {
    console.error("获取订单列表错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

router.get("/drugList", async function (req, res) {
  try {
    let { page = 1, pageSize = 10 } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    let list = await drugModel
      .find({})
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    let total = await drugModel.countDocuments();
    return res.json({ code: 200, msg: "获取成功", data: list, total });
  } catch (error) {
    console.error("获取药品列表错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

// 获取用户权限接口
router.get("/permissions/:userId", async function (req, res) {
  try {
    let { userId } = req.params;

    if (!userId) {
      return res.json({ code: 400, msg: "用户ID不能为空" });
    }

    // 查找用户并关联角色信息
    let user = await positionModel.findById(userId).populate("roleID");
    if (!user) {
      return res.json({ code: 400, msg: "用户不存在" });
    }

    const permissions = user.roleID ? user.roleID.permission : [];
    const roleInfo = user.roleID
      ? {
          _id: user.roleID._id,
          name: user.roleID.name,
        }
      : null;

    return res.json({
      code: 200,
      msg: "获取权限成功",
      data: {
        permissions,
        roleInfo,
        userId: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("获取权限错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

// 仪表板统计数据接口
router.get("/dashboard/stats", async function (req, res) {
  try {
    // 获取统计数据
    const totalUsers = await userModel.countDocuments();
    const totalDrugs = await drugModel.countDocuments();

    // 获取今天的订单数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await orderModel.countDocuments({
      createdAt: { $gte: today },
    });

    // 获取今天的收入（假设订单有金额字段）
    const todayRevenueOrders = await orderModel.find({
      createdAt: { $gte: today },
    });
    const todayRevenue = todayRevenueOrders.reduce((sum, order) => {
      return sum + (order.amount || 0);
    }, 0);

    return res.json({
      code: 200,
      msg: "获取统计数据成功",
      data: {
        totalUsers,
        totalDrugs,
        todayOrders,
        todayRevenue,
      },
    });
  } catch (error) {
    console.error("获取统计数据错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

// 仪表板活动记录接口
router.get("/dashboard/activities", async function (req, res) {
  try {
    // 获取最近的活动记录
    const recentActivities = [
      { id: "1", icon: "User", title: "新用户注册：张三", time: "10分钟前" },
      {
        id: "2",
        icon: "FirstAidKit",
        title: "添加新药品：感冒灵",
        time: "30分钟前",
      },
      {
        id: "3",
        icon: "Document",
        title: "新订单：ORD2024001",
        time: "1小时前",
      },
      { id: "4", icon: "Wallet", title: "收入统计更新", time: "2小时前" },
      { id: "5", icon: "Setting", title: "系统设置更新", time: "3小时前" },
    ];

    return res.json({
      code: 200,
      msg: "获取活动记录成功",
      data: recentActivities,
    });
  } catch (error) {
    console.error("获取活动记录错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});

module.exports = router;
