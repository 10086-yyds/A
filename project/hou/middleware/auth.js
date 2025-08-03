const { positionModel } = require("../db/model");

// 权限验证中间件
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // 从请求头或查询参数中获取用户ID
      const userId = req.headers['user-id'] || req.query.userId;
      
      if (!userId) {
        return res.json({ code: 401, msg: "未提供用户ID" });
      }
      
      // 查找用户并关联角色信息
      const user = await positionModel.findById(userId).populate('roleID');
      if (!user) {
        return res.json({ code: 401, msg: "用户不存在" });
      }
      
      // 检查用户是否有角色
      if (!user.roleID) {
        return res.json({ code: 403, msg: "用户没有分配角色" });
      }
      
      // 检查用户是否有所需权限
      const userPermissions = user.roleID.permission || [];
      if (!userPermissions.includes(requiredPermission)) {
        return res.json({ code: 403, msg: "权限不足" });
      }
      
      // 将用户信息添加到请求对象中，供后续路由使用
      req.user = user;
      next();
    } catch (error) {
      console.error("权限验证错误:", error);
      return res.json({ code: 500, msg: "服务器错误" });
    }
  };
};

// 检查多个权限的中间件（用户需要拥有所有指定权限）
const checkMultiplePermissions = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers['user-id'] || req.query.userId;
      
      if (!userId) {
        return res.json({ code: 401, msg: "未提供用户ID" });
      }
      
      const user = await positionModel.findById(userId).populate('roleID');
      if (!user) {
        return res.json({ code: 401, msg: "用户不存在" });
      }
      
      if (!user.roleID) {
        return res.json({ code: 403, msg: "用户没有分配角色" });
      }
      
      const userPermissions = user.roleID.permission || [];
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        return res.json({ code: 403, msg: "权限不足" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("权限验证错误:", error);
      return res.json({ code: 500, msg: "服务器错误" });
    }
  };
};

// 检查任一权限的中间件（用户需要拥有至少一个指定权限）
const checkAnyPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers['user-id'] || req.query.userId;
      
      if (!userId) {
        return res.json({ code: 401, msg: "未提供用户ID" });
      }
      
      const user = await positionModel.findById(userId).populate('roleID');
      if (!user) {
        return res.json({ code: 401, msg: "用户不存在" });
      }
      
      if (!user.roleID) {
        return res.json({ code: 403, msg: "用户没有分配角色" });
      }
      
      const userPermissions = user.roleID.permission || [];
      const hasAnyPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAnyPermission) {
        return res.json({ code: 403, msg: "权限不足" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("权限验证错误:", error);
      return res.json({ code: 500, msg: "服务器错误" });
    }
  };
};

module.exports = {
  checkPermission,
  checkMultiplePermissions,
  checkAnyPermission
}; 