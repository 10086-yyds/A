import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';

const Cart = ({route,navigation}:any) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // 加载购物车数据
  const loadCartItems = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cartItems');
      if (cartData) {
        const items = JSON.parse(cartData);
        setCartItems(items);
        calculateTotal(items);
      }
    } catch (error) {
      console.error('加载购物车数据失败:', error);
    }
  };

  // 计算总价
  const calculateTotal = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
  };

  // 更新商品数量
  const updateQuantity = async (itemId: string, spec: string, newQuantity: number) => {
    try {
      const updatedItems = cartItems.map(item => {
        if (item._id === itemId && item.spec === spec) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0); // 移除数量为0的商品

      await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      console.error('更新数量失败:', error);
    }
  };

  // 删除商品
  const removeItem = async (itemId: string, spec: string) => {
    console.log(itemId,spec)
    try {
      console.log('删除商品:', { itemId, spec });
      const updatedItems = cartItems.filter(item => !(item._id === itemId && item.spec === spec));
      console.log('删除后的商品列表:', updatedItems);
      await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
      console.log('商品删除成功');
    } catch (error) {
      console.error('删除商品失败:', error);
    }
  };

  // 清空购物车
  const clearCart = async () => {
    try {
      console.log('清空购物车');
      await AsyncStorage.removeItem('cartItems');
      setCartItems([]);
      setTotalPrice(0);
      console.log('购物车清空成功');
    } catch (error) {
      console.error('清空购物车失败:', error);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, []);

  // 监听路由参数变化，重新加载数据
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 只在页面重新获得焦点时重新加载数据，避免覆盖本地操作
      if (cartItems.length === 0) {
        loadCartItems();
      }
    });

    return unsubscribe;
  }, [navigation, cartItems.length]);

  return (
    <View style={styles.container}>
      <Navbar
        title={"购物车"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartText}>购物车是空的</Text>
          <TouchableOpacity 
            style={styles.goShoppingButton}
            onPress={() => navigation.navigate('MainApp', { screen: 'Drug' })}
          >
            <Text style={styles.goShoppingText}>去购物</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {cartItems.map((item, index) => (
              <View key={`${item._id}-${item.spec}-${index}`} style={styles.cartItem}>
                <View style={styles.itemImage}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderIcon}>📋</Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.tag && `[${item.tag}]`}{item.name}
                  </Text>
                  <Text style={styles.itemSpec}>{item.spec}</Text>
                  <Text style={styles.itemPrice}>¥{item.price}</Text>
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item._id, item.spec, item.quantity - 1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item._id, item.spec, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => {
                      Alert.alert(
                        '确认删除',
                        '确定要删除这个商品吗？',
                        [
                          { text: '取消', style: 'cancel' },
                          { text: '删除', style: 'destructive', onPress: () => removeItem(item._id, item.spec) }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.removeButtonText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>总计:</Text>
              <Text style={styles.totalPrice}>¥{totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  Alert.alert(
                    '确认清空',
                    '确定要清空购物车吗？',
                    [
                      { text: '取消', style: 'cancel' },
                      { text: '清空', style: 'destructive', onPress: clearCart }
                    ]
                  );
                }}
              >
                <Text style={styles.clearButtonText}>清空</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => {
                  navigation.navigate('DrugOrder',{
                    cartItems:cartItems
                  })
                }}
              >
                <Text style={styles.checkoutButtonText}>结算</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // 空购物车样式
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  goShoppingButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goShoppingText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // 购物车列表样式
  cartList: {
    flex: 1,
  },
  cartItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 30,
    color: '#ccc',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  itemSpec: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#333',
  },
  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  // 底部栏样式
  bottomBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
  },
  checkoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  checkoutButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Cart; 