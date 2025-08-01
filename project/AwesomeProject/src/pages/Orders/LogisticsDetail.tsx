import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Clipboard,
  Alert
} from 'react-native';
import Navbar from '../../components/Navbar';

interface LogisticsItem {
  id: string;
  status: '派件' | '签收' | '在途';
  description: string;
  time: string;
  isActive?: boolean;
}

const LogisticsDetail = ({ navigation, route }: any) => {
  const { orderNumber } = route.params;

  // 模拟物流信息
  const orderInfo = {
    orderNumber: 'MJ39000388232922267',
    address: '陕西省西安市莲湖区东华门街158号世纪博亮二期商业区12-3-1601室',
    expressNumber: 'ZT8378559934410Q9',
    expressCompany: '中通快递'
  };

  const logisticsData: LogisticsItem[] = [
    {
      id: '1',
      status: '派件',
      description: '客户署名签收（4016*3940068），感谢使用中通快递，期待再次为您服务！',
      time: '2022-08-02 09:30:39',
      isActive: true
    },
    {
      id: '2',
      status: '签收',
      description: '客户署名代签收，如有疑问请联系（0316-8340606），感谢使用中通快递，期待再次为您服务！',
      time: '2022-08-02 09:30:39'
    },
    {
      id: '3',
      status: '派件',
      description: '【廊坊市】的客户（177*6105563）正在第1次派件，请预留联系方式畅通，快递小哥将竭诚为您服务（95720为中通快递官方客服电话，可放心接听）',
      time: '2022-08-02 09:05:47'
    },
    {
      id: '4',
      status: '在途',
      description: '快件已经到达【廊坊市】',
      time: '2022-08-02 03:06:13'
    },
    {
      id: '5',
      status: '在途',
      description: '快件离开【开封中转部】已发往【廊坊】',
      time: '2022-08-01 20:24:15'
    },
    {
      id: '6',
      status: '在途',
      description: '快件已到达 开封中转部',
      time: ''
    }
  ];

  const copyExpressNumber = () => {
    Clipboard.setString(orderInfo.expressNumber);
    Alert.alert('提示', '快递单号已复制到剪贴板');
  };

  const getStatusColor = (status: string, isActive?: boolean) => {
    if (isActive) return '#4CAF50';
    switch (status) {
      case '派件': return '#4CAF50';
      case '签收': return '#2196F3';
      case '在途': return '#999';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '派件': return '🚚';
      case '签收': return '✅';
      case '在途': return '📦';
      default: return '•';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar
        title="物流详情"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 订单信息 */}
        <View style={styles.orderSection}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>📦 订单编号：</Text>
            <Text style={styles.orderValue}>{orderInfo.orderNumber}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>📍 收货地址：</Text>
            <Text style={styles.orderValue}>{orderInfo.address}</Text>
          </View>
        </View>

        {/* 快递信息 */}
        <View style={styles.expressSection}>
          <View style={styles.expressHeader}>
            <View style={styles.expressInfo}>
              <Text style={styles.expressCompany}>📦 {orderInfo.expressCompany}</Text>
              <Text style={styles.expressNumber}>{orderInfo.expressNumber}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={copyExpressNumber}>
              <Text style={styles.copyButtonText}>复制</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 物流轨迹 */}
        <View style={styles.trackingSection}>
          {logisticsData.map((item, index) => (
            <View key={item.id} style={styles.trackingItem}>
              <View style={styles.trackingLeft}>
                <View style={[styles.trackingDot, { backgroundColor: getStatusColor(item.status, item.isActive) }]}>
                  <Text style={styles.trackingIcon}>{getStatusIcon(item.status)}</Text>
                </View>
                {index < logisticsData.length - 1 && <View style={styles.trackingLine} />}
              </View>

              <View style={styles.trackingContent}>
                <View style={styles.trackingHeader}>
                  <Text style={[styles.trackingStatus, { color: getStatusColor(item.status, item.isActive) }]}>
                    {item.status}
                  </Text>
                  {item.time && <Text style={styles.trackingTime}>{item.time}</Text>}
                </View>
                <Text style={[styles.trackingDescription, item.isActive && styles.activeDescription]}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  // 订单信息
  orderSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  orderRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  orderValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  // 快递信息
  expressSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  expressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expressInfo: {
    flex: 1,
  },
  expressCompany: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  expressNumber: {
    fontSize: 14,
    color: '#666',
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // 物流轨迹
  trackingSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  trackingItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  trackingLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  trackingDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  trackingIcon: {
    fontSize: 16,
    color: '#fff',
  },
  trackingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: -5,
  },
  trackingContent: {
    flex: 1,
    paddingTop: 5,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackingTime: {
    fontSize: 12,
    color: '#999',
  },
  trackingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  activeDescription: {
    color: '#333',
    fontWeight: '500',
  },
});

export default LogisticsDetail;