var express = require('express');
var router = express.Router();
const { drugModel } = require('../../db/model.js');
/* GET home page. */
router.get('/', async (req, res, next) => {
  let response = await drugModel.find()
  console.log('请求已抵达')
  res.send({
    data:response
  })
});

module.exports = router;
