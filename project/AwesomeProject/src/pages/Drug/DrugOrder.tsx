import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';

const DrugOrder = ({ route, navigation }: any) => {
    const { cartItems } = route.params;
    const [orderNote, setOrderNote] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<any>(null);

    // 计算总价
    const calculateTotal = () => {
        if (!cartItems || cartItems.length === 0) return 0;
        return cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmitOrder = () => {
        console.log('提交订单:', {
            items: cartItems,
            total: calculateTotal(),
            note: orderNote,
            address: selectedAddress
        });
        console.log('当前选中的地址:', selectedAddress);
        
        // 跳转到支付页面
        navigation.navigate('PayMoney', {
            amount: calculateTotal() + (calculateTotal() >= 99 ? 0 : 8)
        });
    };

    // 加载保存的地址信息
    const loadSavedAddress = async () => {
        try {
            const savedAddress = await AsyncStorage.getItem('selectedAddress');
            if (savedAddress) {
                const parsedAddress = JSON.parse(savedAddress);
                setSelectedAddress(parsedAddress);
                console.log('从本地存储加载地址:', parsedAddress);
            } else {
                console.log('本地存储中没有保存的地址');
            }
        } catch (error) {
            console.error('加载保存的地址失败:', error);
        }
    };

    // 监听路由参数变化，接收选中的地址
    useEffect(() => {
        if (route.params?.selectedAddress) {
            setSelectedAddress(route.params.selectedAddress);
            console.log('从路由参数接收地址:', route.params.selectedAddress);
        }
    }, [route.params?.selectedAddress]);

    // 页面加载时读取保存的地址
    useEffect(() => {
        loadSavedAddress();
    }, []);

    // 监听页面焦点，重新加载地址
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadSavedAddress();
        });

        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Navbar
                title="确认订单"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 收货地址 */}
                <TouchableOpacity style={styles.addressSection} onPress={()=>{
                    navigation.navigate('AddressList', { isSelectMode: true })
                }}>
                    <View style={styles.addressContent}>
                        <Text style={styles.locationIcon}>📍</Text>
                        {selectedAddress ? (
                            <View style={styles.selectedAddressInfo}>
                                <Text style={styles.addressName}>{selectedAddress.name} {selectedAddress.phone}</Text>
                                <Text style={styles.addressDetail}>{selectedAddress.address}</Text>
                            </View>
                        ) : (
                            <Text style={styles.addressText}>选择收货地址</Text>
                        )}
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                {/* 商品列表 */}
                <View style={styles.productSection}>
                    {cartItems && cartItems.map((item: any, index: number) => (
                        <View key={`${item._id}-${index}`} style={styles.productItem}>
                            <View style={styles.productImage}>
                                {item.image ? (
                                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Text style={styles.placeholderIcon}>📋</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>
                                    {item.tag && `[${item.tag}]`}{item.name}
                                </Text>
                                <Text style={styles.productDesc}>
                                    0.25g*12粒*2板镇静安神咽喉肿痛上
                                </Text>
                                <Text style={styles.productSpec}>{item.spec}</Text>
                                <View style={styles.productBottom}>
                                    <Text style={styles.productPrice}>¥{item.price}</Text>
                                    <Text style={styles.productQuantity}>×{item.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* 订单金额 */}
                <View style={styles.orderSummary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>商品总额:</Text>
                        <Text style={styles.summaryValue}>¥{calculateTotal().toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>运费:</Text>
                        <Text style={styles.summaryValue}>
                            ¥{calculateTotal() >= 99 ? 0 : 8}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>优惠:</Text>
                        <Text style={styles.summaryValue}>-¥0</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>合计:</Text>
                        <Text style={styles.totalValue}>¥{(calculateTotal() + (calculateTotal() >= 99 ? 0 : 8)).toFixed(2)}</Text>
                    </View>
                </View>

                {/* 订单留言 */}
                <View style={styles.noteSection}>
                    <Text style={styles.noteLabel}>订单留言:</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="选填, 20个字以内"
                        placeholderTextColor="#999"
                        value={orderNote}
                        onChangeText={setOrderNote}
                        maxLength={20}
                        multiline
                    />
                </View>
            </ScrollView>

            {/* 底部提交栏 */}
            <View style={styles.bottomBar}>
                <View style={styles.totalSection}>
                    <Text style={styles.bottomTotal}>¥{(calculateTotal() + (calculateTotal() >= 99 ? 0 : 8)).toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitOrder}>
                    <Text style={styles.submitText}>提交订单</Text>
                </TouchableOpacity>
            </View>
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
    },
    // 地址区域样式
    addressSection: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 10,
    },
    addressContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
    },
    selectedAddressInfo: {
        flex: 1,
        marginLeft: 8,
    },
    addressName: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    addressDetail: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    arrow: {
        fontSize: 16,
        color: '#999',
    },
    // 商品区域样式
    productSection: {
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    productItem: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productImage: {
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
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    productDesc: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    productSpec: {
        fontSize: 12,
        color: '#999',
        marginBottom: 5,
    },
    productBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff4444',
    },
    productQuantity: {
        fontSize: 14,
        color: '#666',
    },
    // 订单汇总样式
    orderSummary: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff4444',
    },
    // 订单留言样式
    noteSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 10,
    },
    noteLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    noteInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        minHeight: 40,
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
    bottomTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff4444',
    },
    submitButton: {
        backgroundColor: '#333',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    submitText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default DrugOrder; 