var express = require('express');
var router = express.Router();
var {articleModel,positionModel} = require("../../db/model")
/* GET home page. */
router.get("/getArticle",async (req,res) => {
  const data = await articleModel.find({})
  res.send(data)
})
router.get("/getDoctor",async (req,res) => {
  // 过滤roleID为指定值的医生
  const data = await positionModel.find({
    roleID: "688b5a2043564643c1fdd7b7"
  })
  console.log("过滤后的医生数据:", data)
  
  res.send(data)
})
module.exports = router;
