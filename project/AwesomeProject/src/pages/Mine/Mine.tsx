import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const Mine = ({ navigation }: any) => {
  const { user, logout, isAuthenticated } = useAuth();

  // 处理退出登录
  const handleLogout = () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  // 诊疗室功能
  const clinicItems = [
    {
      id: 1,
      title: '在线问诊',
      icon: '💬',
      onPress: () => Alert.alert('提示', '在线问诊功能开发中...')
    },
    {
      id: 2,
      title: '免费问诊',
      icon: '📝',
      onPress: () => Alert.alert('提示', '免费问诊功能开发中...')
    },
    {
      id: 3,
      title: '电子处方',
      icon: '💰',
      onPress: () => Alert.alert('提示', '电子处方功能开发中...')
    },
    {
      id: 4,
      title: '预约挂号',
      icon: '🏥',
      onPress: () => Alert.alert('提示', '预约挂号功能开发中...')
    }
  ];

  // 订单状态
  const orderItems = [
    {
      id: 1,
      title: '待开方',
      icon: '📝',
      badge: 0,
      onPress: () => navigation.navigate('MyOrders', { status: 'pending_prescription' })
    },
    {
      id: 2,
      title: '待付款',
      icon: '💳',
      badge: 3,
      onPress: () => navigation.navigate('MyOrders', { status: 'pending_payment' })
    },
    {
      id: 3,
      title: '待发货',
      icon: '📦',
      badge: 0,
      onPress: () => navigation.navigate('MyOrders', { status: 'pending_shipment' })
    },
    {
      id: 4,
      title: '待收货',
      icon: '🚚',
      badge: 0,
      onPress: () => navigation.navigate('MyOrders', { status: 'pending_receipt' })
    },
    {
      id: 5,
      title: '退款售后',
      icon: '🔄',
      badge: 2,
      onPress: () => navigation.navigate('MyOrders', { status: 'refund' })
    }
  ];

  // 更多功能
  const moreItems = [
    {
      id: 1,
      title: '我的关注',
      icon: '👁️',
      onPress: () => Alert.alert('提示', '我的关注功能开发中...')
    },
    {
      id: 2,
      title: '我的收藏',
      icon: '⭐',
      onPress: () => Alert.alert('提示', '我的收藏功能开发中...')
    },
    {
      id: 3,
      title: '我的琦频',
      icon: '📺',
      onPress: () => Alert.alert('提示', '我的琦频功能开发中...')
    },
    {
      id: 4,
      title: '我的评价',
      icon: '💬',
      onPress: () => Alert.alert('提示', '我的评价功能开发中...')
    },
    {
      id: 5,
      title: '收货地址',
      icon: '📍',
      onPress: () => Alert.alert('提示', '收货地址功能开发中...')
    },
    {
      id: 6,
      title: '联系客服',
      icon: '🎧',
      onPress: () => Alert.alert('提示', '联系客服功能开发中...')
    },
    {
      id: 7,
      title: '系统设置',
      icon: '⚙️',
      onPress: () => Alert.alert('提示', '系统设置功能开发中...')
    },
    {
      id: 8,
      title: '退出登录',
      icon: '🚪',
      onPress: handleLogout
    }
  ];

  return (
    <View style={styles.container}>
      <Navbar
        title="我的"
        showBack={false}
        backgroundColor="#fff"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 用户信息区域 */}
        <View style={styles.userSection}>
          <TouchableOpacity style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>
                  {user?.avatar ? user.avatar : (user?.username ? user.username.charAt(0).toUpperCase() : '👤')}
                </Text>
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>
                {user?.username || '未登录用户'}
              </Text>
              <Text style={styles.userSubtitle}>
                {user?.email || '点击编辑个人资料'}
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 我的诊疗室 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我的诊疗室</Text>
          <View style={styles.gridContainer}>
            {clinicItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridItem} onPress={item.onPress}>
                <View style={styles.gridIcon}>
                  <Text style={styles.gridIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.gridText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 我的订单 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我的订单</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyOrders')}>
              <Text style={styles.viewAll}>全部&gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.orderContainer}>
            {orderItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.orderItem} onPress={item.onPress}>
                <View style={styles.orderIcon}>
                  <Text style={styles.orderIconText}>{item.icon}</Text>
                  {item.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.orderText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 更多功能 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>更多功能</Text>
          <View style={styles.moreContainer}>
            {moreItems.map((item, index) => (
              <TouchableOpacity key={item.id} style={styles.moreItem} onPress={item.onPress}>
                <View style={styles.moreIcon}>
                  <Text style={styles.moreIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.moreText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
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
  // 用户信息区域
  userSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    marginLeft: 'auto',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: '300',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 30,
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  // 通用section样式
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAll: {
    fontSize: 14,
    color: '#666',
  },
  // 诊疗室网格
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    alignItems: 'center',
    width: '22%',
  },
  gridIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridIconText: {
    fontSize: 24,
  },
  gridText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // 订单状态
  orderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderItem: {
    alignItems: 'center',
    width: '18%',
    position: 'relative',
  },
  orderIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  orderIconText: {
    fontSize: 20,
  },
  orderText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // 更多功能
  moreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 20,
  },
  moreIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moreIconText: {
    fontSize: 18,
  },
  moreText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});

export default Mine; 