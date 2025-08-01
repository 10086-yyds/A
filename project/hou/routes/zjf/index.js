var express = require('express');
var router = express.Router();
const { drugModel,orderModel } = require('../../db/model.js');
/* GET home page. */
router.get('/', async (req, res, next) => {
  let response = await drugModel.find()
  console.log('请求已抵达')
  res.send({
    data:response
  })
});

router.get('/HuiXian', async (req, res, next) => {
  const { key } = req.query
  let response = await drugModel.find({key:key})
  res.send({
    data:response
  })
});


router.get('/SouSuo', async (req,res,next) => {
  const { searchText } = req.query
  console.log(searchText,'1111')
  let response = await drugModel.find({name:searchText})
  if ( !response ) return
  res.send({
    data:response
  })
})

//详情页
router.get('/Info', async (req,res,next) => {
  const { _id } = req.query
  let response = await drugModel.find({_id:_id})
  if ( !response ) return
  res.send({
    data:response
  })
})

router.post('/PayMoney', async (req,res,next) => {
  try {
    const cartItems = req.body;
    
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: '购物车数据格式错误'
      });
    }
    
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // 获取配送地址（从第一个商品中获取）
    const deliveryAddress = cartItems.length > 0 ? cartItems[0].deliveryAddress : '';
    
    // 创建新订单并保存到数据库
    const newOrder = new orderModel({
      orderPrice: totalAmount.toString(), // 将总金额设置为订单金额
      orderStatus: true, // 订单状态设置为true
      address: deliveryAddress || "陕西省西安市莲湖区东华门街道158号世纪博苑三期南区12-3-1601室" // 设置配送地址
    });
    
    // 保存订单到数据库
    const savedOrder = await newOrder.save();
    console.log('订单保存成功:', savedOrder);
    
    // 返回成功响应
    res.json({
      success: true,
      message: '支付成功',
      orderId: savedOrder._id.toString(),
      orderNumber: savedOrder.orderNumber,
      totalAmount: totalAmount,
      itemsCount: cartItems.length,
      deliveryAddress: deliveryAddress,
      savedOrderData: {
        orderNumber: savedOrder.orderNumber,
        phoneNumber: savedOrder.phoneNumber,
        illName: savedOrder.illName,
        orderPrice: savedOrder.orderPrice,
        orderTime: savedOrder.orderTime,
        orderStatus: savedOrder.orderStatus,
        address: savedOrder.address
      }
    });
    
  } catch (error) {
    console.error('支付处理错误:', error);
    res.status(500).json({
      success: false,
      message: '支付处理失败',
      error: error.message
    });
  }
})


module.exports = router;
