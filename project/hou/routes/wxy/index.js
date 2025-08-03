var express = require('express');
var router = express.Router();
var { articleModel, positionModel } = require("../../db/model")
/* GET home page. */
// {{ AURA-X: Modify - 添加错误处理和标准响应格式. Approved: 代码质量修复. }}
router.get("/getArticle", async (req, res) => {
  try {
    const data = await articleModel.find({});
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取文章失败",
      error: error.message
    });
  }
});
// {{ AURA-X: Modify - 移除硬编码ObjectId和调试代码，添加错误处理. Approved: 安全和质量修复. }}
router.get("/getDoctor", async (req, res) => {
  try {
    // 查询所有医生，由前端或业务逻辑层进行过滤
    const data = await positionModel.find({}).populate('roleID');

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取医生失败",
      error: error.message
    });
  }
});
module.exports = router;
