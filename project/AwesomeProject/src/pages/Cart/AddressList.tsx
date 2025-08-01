import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';

const AddressList = ({ navigation, route }: any) => {
  // 检查是否是从订单页面跳转过来的（用于选择地址）
  const isSelectMode = route.params?.isSelectMode;
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: '李女士',
      phone: '13512341234',
      address: '陕西省西安市莲湖区东华门街道158号世纪博苑三期南区12-3-1601室',
      isDefault: true
    },
    {
      id: 2,
      name: '张女士',
      phone: '13512341234',
      address: '陕西省西安市莲湖区东华门街道158号世纪博苑三期南区12-3-1601室',
      isDefault: false
    },
    {
      id: 3,
      name: '裴女士',
      phone: '13512341234',
      address: '陕西省西安市莲湖区东华门街道158号世纪博苑三期南区12-3-1601室',
      isDefault: false
    }
  ]);

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDelete = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleEdit = (id: number) => {
    // 这里可以导航到编辑地址页面
    console.log('编辑地址:', id);
  };

  const handleAddNew = () => {
    // 这里可以导航到添加地址页面
    console.log('添加新地址');
  };
  const [addressInfo, setAddressInfo] = useState<any>(null);
  
  // 加载保存的地址信息
  const loadSavedAddress = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('selectedAddress');
      if (savedAddress) {
        setAddressInfo(JSON.parse(savedAddress));
      }
    } catch (error) {
      console.error('加载保存的地址失败:', error);
    }
  };
  
  // 保存地址信息到本地存储
  const saveAddressToStorage = async (address: any) => {
    try {
      await AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
      console.log('地址已保存到本地存储');
    } catch (error) {
      console.error('保存地址失败:', error);
    }
  };
  
  // 清除保存的地址信息
  const clearSavedAddress = async () => {
    try {
      await AsyncStorage.removeItem('selectedAddress');
      setAddressInfo(null);
      console.log('已清除保存的地址');
    } catch (error) {
      console.error('清除地址失败:', error);
    }
  };
  
  // 页面加载时读取保存的地址
  useEffect(() => {
    loadSavedAddress();
  }, []);
  
  const handleSelectAddress = async (address: any) => {
    console.log('选择地址:', address);
    // 保存地址到本地存储
    await saveAddressToStorage(address);
    setAddressInfo(address);
  };

  return (
    <View style={styles.container}>
      <Navbar
        title="收货地址"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 显示当前选中的地址信息 */}
        {addressInfo && (
          <View style={styles.selectedAddressCard}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedTitle}>当前选中地址：</Text>
              <TouchableOpacity onPress={clearSavedAddress}>
                <Text style={styles.clearButton}>清除</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedName}>{addressInfo.name} {addressInfo.phone}</Text>
            <Text style={styles.selectedAddress}>{addressInfo.address}</Text>
          </View>
        )}
        
        {addresses.map((address) => (
          <TouchableOpacity 
            key={address.id} 
            style={styles.addressCard}
            onPress={() => handleSelectAddress(address)}
            disabled={!isSelectMode}
          >
            {/* 地址信息 */}
            <View style={styles.addressInfo}>
              <View style={styles.headerRow}>
                <Text style={styles.name}>{address.name}</Text>
                <Text style={styles.phone}>{address.phone}</Text>
              </View>
              <Text style={styles.address}>{address.address}</Text>
            </View>
            
            {/* 分割线 */}
            <View style={styles.separator} />
            
            {/* 操作按钮 */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.defaultSection}
                onPress={(e) => {
                  e.stopPropagation(); // 阻止冒泡
                  handleSetDefault(address.id);
                }}
              >
                {address.isDefault ? (
                  <>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.defaultText}>默认地址</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.radioIcon}>○</Text>
                    <Text style={styles.defaultText}>设为默认</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation(); // 阻止冒泡
                    handleDelete(address.id);
                  }}
                >
                  <Text style={styles.actionText}>删除</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation(); // 阻止冒泡
                    handleEdit(address.id);
                  }}
                >
                  <Text style={styles.actionText}>修改</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* 添加新地址按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Text style={styles.addButtonText}>添加新地址</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressInfo: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  phone: {
    fontSize: 14,
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  defaultSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
  },
  radioIcon: {
    fontSize: 16,
    color: '#ccc',
    marginRight: 8,
  },
  defaultText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 20,
  },
  addButton: {
    backgroundColor: '#666',
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // 选中地址显示样式
  selectedAddressCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  selectedTitle: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    fontSize: 12,
    color: '#ff4444',
    textDecorationLine: 'underline',
  },
  selectedName: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AddressList; 