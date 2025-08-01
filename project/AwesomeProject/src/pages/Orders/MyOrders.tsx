import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert
} from 'react-native';
import Navbar from '../../components/Navbar';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending_prescription' | 'pending_payment' | 'pending_shipment' | 'pending_receipt' | 'refund';
  price: string;
  products: {
    name: string;
    image: string | null;
  }[];
}

const MyOrders = ({ navigation, route }: any) => {
  const [activeTab, setActiveTab] = useState(route?.params?.status || 'all');

  // 模拟订单数据
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'MJ39000388232922267',
      status: 'pending_prescription',
      price: '¥529.98',
      products: [{ name: '商品名称', image: null }]
    },
    {
      id: '2',
      orderNumber: 'MJ39000388232922267',
      status: 'pending_payment',
      price: '¥529.98',
      products: [{ name: '商品名称', image: null }]
    },
    {
      id: '3',
      orderNumber: 'MJ39000388232922267',
      status: 'pending_receipt',
      price: '¥18.6',
      products: [{ name: '小葵花 小儿咳喘灵口服液 10ml*6支 宣肺 清热 止咳 10ml*6支', image: null }]
    },
    {
      id: '4',
      orderNumber: 'MJ39000388232922267',
      status: 'pending_receipt',
      price: '¥529.98',
      products: [{ name: '商品名称', image: null }]
    }
  ];

  const tabs = [
    { key: 'all', title: '全部', count: 0 },
    { key: 'pending_prescription', title: '待开方', count: 0 },
    { key: 'pending_payment', title: '待付款', count: 3 },
    { key: 'pending_shipment', title: '待发货', count: 0 },
    { key: 'pending_receipt', title: '待收货', count: 3 },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_prescription': return '待开方';
      case 'pending_payment': return '待付款';
      case 'pending_shipment': return '待发货';
      case 'pending_receipt': return '待收货';
      case 'refund': return '待收货';
      default: return '';
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => order.status === activeTab);
  };

  const getOrderActions = (status: string) => {
    switch (status) {
      case 'pending_prescription':
        return [
          { text: '去开方', style: 'primary', onPress: () => Alert.alert('提示', '去开方功能开发中...') },
          { text: '取消订单', style: 'secondary', onPress: () => Alert.alert('提示', '取消订单功能开发中...') }
        ];
      case 'pending_payment':
        return [
          { text: '立即付款', style: 'primary', onPress: () => Alert.alert('提示', '立即付款功能开发中...') },
          { text: '取消订单', style: 'secondary', onPress: () => Alert.alert('提示', '取消订单功能开发中...') }
        ];
      case 'pending_receipt':
        return [
          { text: '确认收货', style: 'primary', onPress: () => Alert.alert('提示', '确认收货功能开发中...') },
          { text: '申请退款', style: 'secondary', onPress: () => Alert.alert('提示', '申请退款功能开发中...') }
        ];
      default:
        return [];
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      {/* 订单头部 */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>订单号：{item.orderNumber}</Text>
        <Text style={styles.orderStatus}>{getStatusText(item.status)}</Text>
      </View>

      {/* 商品区域 */}
      <View style={styles.productSection}>
        <View style={styles.productImages}>
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.placeholderIcon}>📦</Text>
          </View>
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.placeholderIcon}>📦</Text>
          </View>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          >
            <Text style={styles.viewMoreText}>查看更多</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.priceLabel}>共1件</Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionSection}>
        {getOrderActions(item.status).map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.style === 'primary' ? styles.primaryButton : styles.secondaryButton]}
            onPress={action.onPress}
          >
            <Text style={[styles.actionText, action.style === 'primary' ? styles.primaryText : styles.secondaryText]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Navbar
        title="我的订单"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* 标签页 */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.title}
                {tab.count > 0 && <Text style={styles.tabCount}>({tab.count})</Text>}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 订单列表 */}
      <FlatList
        data={getFilteredOrders()}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        style={styles.orderList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // 标签页
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'relative',
  },
  activeTab: {
    // 激活状态样式
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabCount: {
    fontSize: 15,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#4CAF50',
  },
  // 订单列表
  orderList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
  },
  // 订单头部
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // 商品区域
  productSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productImages: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  placeholderIcon: {
    fontSize: 24,
  },
  viewMoreButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#666',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  // 操作按钮
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#666',
  },
});

export default MyOrders;