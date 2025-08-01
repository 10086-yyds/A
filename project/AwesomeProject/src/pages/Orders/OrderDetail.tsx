import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import Navbar from '../../components/Navbar';

interface Product {
  id: string;
  name: string;
  spec: string;
  price: string;
  quantity: number;
  status?: string;
  image?: string;
}

interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: 'pending_prescription' | 'pending_payment' | 'pending_shipment' | 'pending_receipt';
  address: {
    name: string;
    phone: string;
    detail: string;
  };
  products: Product[];
  pricing: {
    subtotal: string;
    shipping: string;
    discount: string;
    total: string;
    payable: string;
  };
  countdown?: string;
  logistics?: {
    company: string;
    number: string;
    status: string;
  };
}

const OrderDetail = ({ navigation, route }: any) => {
  const { orderId } = route.params;
  const [countdown, setCountdown] = useState('00:14:59');

  // 模拟订单详情数据
  const orderDetail: OrderDetailData = {
    id: orderId,
    orderNumber: 'MJ39000388232922267',
    status: 'pending_payment', // 可以根据不同状态展示不同页面
    address: {
      name: '韩梅梅',
      phone: '13512341234',
      detail: '陕西省西安市莲湖区东华门街158号世纪博亮二期商业区12-3-1601室'
    },
    products: [
      {
        id: '1',
        name: '[处方药]白云山清开灵胶囊清热',
        spec: '0.25g*12粒*2板',
        price: '¥14.5',
        quantity: 1,
        status: '已开方'
      },
      {
        id: '2',
        name: '[处方药]小葵花 小儿咳喘灵口服液',
        spec: '10ml*6支',
        price: '¥18.6',
        quantity: 1,
        status: '已开方'
      },
      {
        id: '3',
        name: '安药川贝清肺糖浆100ml/瓶',
        spec: '100ml/瓶',
        price: '¥18.6',
        quantity: 1
      }
    ],
    pricing: {
      subtotal: '¥51.70',
      shipping: '¥8',
      discount: '-0',
      total: '¥59.70',
      payable: '¥59.70'
    },
    logistics: {
      company: '华北转运中心',
      number: 'ZT8378559934410Q9',
      status: '已发出'
    }
  };

  useEffect(() => {
    // 倒计时逻辑
    if (orderDetail.status === 'pending_payment') {
      const timer = setInterval(() => {
        // 这里可以实现真实的倒计时逻辑
      }, 1000);
      return () => clearInterval(timer);
    }
  }, []);

  const getStatusHeader = () => {
    switch (orderDetail.status) {
      case 'pending_prescription':
        return (
          <View style={[styles.statusHeader, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.statusTitle}>待开方</Text>
            <Text style={styles.statusSubtitle}>订单包含处方药品，请先在线开方</Text>
          </View>
        );
      case 'pending_payment':
        return (
          <View style={[styles.statusHeader, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.statusTitle}>待付款</Text>
            <Text style={styles.statusSubtitle}>请尽快付款 {countdown}</Text>
          </View>
        );
      case 'pending_shipment':
        return (
          <View style={[styles.statusHeader, { backgroundColor: '#e8f5e8' }]}>
            <Text style={styles.statusTitle}>待发货</Text>
            <Text style={styles.statusSubtitle}>商家正在备货中</Text>
          </View>
        );
      case 'pending_receipt':
        return (
          <View style={[styles.statusHeader, { backgroundColor: '#e8f5e8' }]}>
            <Text style={styles.statusTitle}>待收货</Text>
            <Text style={styles.statusSubtitle}>14天21时38分09秒 后将自动确认收货</Text>
            <TouchableOpacity style={styles.logisticsButton}>
              <Text style={styles.logisticsText}>华北转运中心 已发出，下一站 北京市朝阳区东福...</Text>
              <Text style={styles.logisticsTime}>2022-09-30 16:58</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const getActionButtons = () => {
    switch (orderDetail.status) {
      case 'pending_prescription':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>取消订单</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>去开方</Text>
            </TouchableOpacity>
          </View>
        );
      case 'pending_payment':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>取消订单</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>立即付款</Text>
            </TouchableOpacity>
          </View>
        );
      case 'pending_shipment':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>申请退款</Text>
            </TouchableOpacity>
          </View>
        );
      case 'pending_receipt':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>申请退款</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>确认收货</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar
        title="订单详情"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 状态头部 */}
        {getStatusHeader()}

        {/* 物流信息按钮（仅待收货状态显示详细物流） */}
        {orderDetail.status === 'pending_receipt' && orderDetail.logistics && (
          <TouchableOpacity
            style={styles.logisticsSection}
            onPress={() => navigation.navigate('LogisticsDetail', { orderNumber: orderDetail.orderNumber })}
          >
            <Text style={styles.logisticsTitle}>📦 中通快递</Text>
            <Text style={styles.logisticsNumber}>复制</Text>
          </TouchableOpacity>
        )}

        {/* 收货地址 */}
        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>{orderDetail.address.name} {orderDetail.address.phone}</Text>
              <Text style={styles.addressDetail}>{orderDetail.address.detail}</Text>
            </View>
          </View>
        </View>

        {/* 商品列表 */}
        <View style={styles.productSection}>
          {orderDetail.products.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productImage}>
                <Text style={styles.productImagePlaceholder}>📦</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {product.name}
                  {product.status && <Text style={styles.productStatus}> {product.status}</Text>}
                </Text>
                <Text style={styles.productSpec}>{product.spec}</Text>
                <Text style={styles.productQuantity}>× {product.quantity}</Text>
              </View>
              <View style={styles.productPricing}>
                <Text style={styles.productPrice}>{product.price}</Text>
                {product.status && (
                  <TouchableOpacity style={styles.prescriptionButton}>
                    <Text style={styles.prescriptionButtonText}>已开方</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 价格明细 */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>商品总额：</Text>
            <Text style={styles.pricingValue}>{orderDetail.pricing.subtotal}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>运费：</Text>
            <Text style={styles.pricingValue}>{orderDetail.pricing.shipping}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>优惠：</Text>
            <Text style={styles.pricingValue}>{orderDetail.pricing.discount}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>合计：</Text>
            <Text style={styles.pricingValue}>{orderDetail.pricing.total}</Text>
          </View>
          <View style={[styles.pricingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>应付款：</Text>
            <Text style={styles.totalValue}>{orderDetail.pricing.payable}</Text>
          </View>
        </View>

        {/* 订单编号 */}
        <View style={styles.orderNumberSection}>
          <Text style={styles.orderNumberText}>订单编号： {orderDetail.orderNumber}</Text>
        </View>
      </ScrollView>

      {/* 底部操作按钮 */}
      {getActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  // 状态头部
  statusHeader: {
    padding: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  logisticsButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 6,
    alignItems: 'center',
  },
  logisticsText: {
    fontSize: 14,
    color: '#333',
  },
  logisticsTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  // 物流信息
  logisticsSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
  },
  logisticsTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logisticsNumber: {
    fontSize: 14,
    color: '#4CAF50',
  },
  // 收货地址
  addressSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // 商品列表
  productSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImagePlaceholder: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 5,
  },
  productStatus: {
    color: '#ff4444',
    fontSize: 12,
  },
  productSpec: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 12,
    color: '#999',
  },
  productPricing: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  prescriptionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  prescriptionButtonText: {
    fontSize: 10,
    color: '#fff',
  },
  // 价格明细
  pricingSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // 订单编号
  orderNumberSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  orderNumberText: {
    fontSize: 14,
    color: '#666',
  },
  // 底部操作按钮
  actionContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default OrderDetail;