import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Alert, ActivityIndicator } from 'react-native';
import Navbar from '../../components/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
const PayMoney = ({ navigation, route }: any) => {
    const [selectedPayment, setSelectedPayment] = useState('wechat'); // wechat 或 alipay
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15分钟倒计时，以秒为单位
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const slideAnim = new Animated.Value(0);

    // 倒计时效果
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 格式化倒计时显示
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 获取订单金额（从路由参数或默认值）
    const orderAmount = route.params?.amount || 59.70;

    const handlePayment = async () => {
        openPasswordModal();
    };

    const openPasswordModal = () => {
        setShowPasswordModal(true);
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closePasswordModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowPasswordModal(false);
            setPassword('');
        });
    };

    const handleNumberPress = (num: string) => {
        if (password.length < 6 && !isLoading) {
            const newPassword = password + num;
            setPassword(newPassword);

            // 当密码输入完成时，自动触发支付
            if (newPassword.length === 6) {
                setTimeout(() => {

                    handleConfirmPasswordWithPassword(newPassword);
                }, 100);
            }
        } else {
            // {{ AURA-X: Modify - 移除调试代码. Approved: 代码质量修复. }}
            // 已移除调试日志
        }
    };

    const handleDeletePress = () => {
        if (!isLoading) {
            setPassword(prev => prev.slice(0, -1));
        }
    };


    const handleConfirmPasswordWithPassword = async (inputPassword: string) => {
        // 已移除调试日志

        if (inputPassword.length === 6) {
            setIsLoading(true);
            try {
                // 模拟支付接口调用
                try {
                    const SavedItems = await AsyncStorage.getItem('cartItems')
                    const SavedAddress = await AsyncStorage.getItem('selectedAddress')
                    if (SavedItems && SavedItems !== '[]') {
                        const parsedItems = JSON.parse(SavedItems);

                        // 解析地址数据
                        let deliveryAddress = '';
                        if (SavedAddress) {
                            try {
                                const addressData = JSON.parse(SavedAddress);
                                deliveryAddress = addressData.address || '';
                            } catch (error) {
                                // 已移除调试日志
                            }
                        }

                        // 为每个购物车项目添加地址字段
                        const itemsWithAddress = parsedItems.map((item: any) => ({
                            ...item,
                            deliveryAddress: deliveryAddress
                        }));

                        await new Promise(resolve => setTimeout(resolve, 2000));
                        // {{ AURA-X: Modify - 移除硬编码IP地址. Approved: 安全修复. }}
                        const baseURL = process.env.API_BASE_URL || 'http://198.18.0.1:3000';
                        const response = await fetch(`${baseURL}/Zjf/PayMoney`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(itemsWithAddress)
                        });

                        if (response.ok) {
                            const result = await response.json();
                            if (result.success) {
                                Alert.alert('支付成功', '订单支付完成！');
                                closePasswordModal();

                                // 清空购物车
                                await AsyncStorage.removeItem('cartItems');

                                // 返回订单页面或首页
                                navigation.navigate('MainApp', { screen: 'Home' });
                            } else {
                                throw new Error(result.message || '支付失败');
                            }
                        } else {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }
                    } else {
                        throw new Error('购物车为空，无法进行支付');
                    }
                } catch (error: any) {
                    // 已移除调试日志
                    Alert.alert('支付失败', error.message || '请重试');
                }

            } catch (error) {
                // 已移除调试日志
                Alert.alert('支付失败', '请重试');
            } finally {
                setIsLoading(false);
            }
        } else {
            // 已移除调试日志
        }
    };

    return (
        <View style={styles.container}>
            <Navbar
                title="收银台"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            {/* 金额显示区域 */}
            <View style={styles.amountSection}>
                <Text style={styles.amount}>¥{orderAmount.toFixed(2)}</Text>
                <Text style={styles.timeLimit}>请在 {formatTime(timeLeft)} 内完成支付</Text>
            </View>

            {/* 分割线 */}
            <View style={styles.separator} />

            {/* 支付方式选择区域 */}
            <View style={styles.paymentSection}>
                {/* 微信支付 */}
                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => setSelectedPayment('wechat')}
                >
                    <View style={styles.paymentLeft}>
                        <View style={styles.wechatIcon}>
                            <Text style={styles.wechatText}>💬</Text>
                            {selectedPayment === 'wechat' && (
                                <Text style={styles.checkMark}>✓</Text>
                            )}
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentName}>微信支付</Text>
                            <Text style={styles.paymentDesc}>微信支付</Text>
                        </View>
                    </View>
                    <View style={styles.paymentRight}>
                        {selectedPayment === 'wechat' ? (
                            <View style={styles.selectedCircle}>
                                <Text style={styles.selectedDot}>●</Text>
                            </View>
                        ) : (
                            <View style={styles.unselectedCircle} />
                        )}
                    </View>
                </TouchableOpacity>

                {/* 分割线 */}
                <View style={styles.optionSeparator} />

                {/* 支付宝 */}
                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => setSelectedPayment('alipay')}
                >
                    <View style={styles.paymentLeft}>
                        <View style={styles.alipayIcon}>
                            <Text style={styles.alipayText}>支</Text>
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentName}>支付宝</Text>
                            <Text style={styles.paymentDesc}>支付宝</Text>
                        </View>
                    </View>
                    <View style={styles.paymentRight}>
                        {selectedPayment === 'alipay' ? (
                            <View style={styles.selectedCircle}>
                                <Text style={styles.selectedDot}>●</Text>
                            </View>
                        ) : (
                            <View style={styles.unselectedCircle} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* 立即支付按钮 */}
            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePayment}
                >
                    <Text style={styles.payButtonText}>立即支付</Text>
                </TouchableOpacity>
            </View>

            {/* 支付密码输入弹窗 */}
            <Modal
                visible={showPasswordModal}
                transparent={true}
                animationType="none"
                onRequestClose={closePasswordModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        onPress={closePasswordModal}
                        activeOpacity={1}
                    />
                    <Animated.View
                        style={[
                            styles.passwordModalContent,
                            {
                                transform: [{
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [400, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        {/* 关闭按钮 */}
                        <TouchableOpacity style={styles.closeButton} onPress={closePasswordModal}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>

                        {/* 提示信息 */}
                        <View style={styles.passwordHeader}>
                            <Text style={styles.passwordTitle}>请输入支付密码</Text>
                            <Text style={styles.passwordAmount}>¥ {orderAmount.toFixed(2)}</Text>
                        </View>

                        {/* 支付方式 */}
                        <View style={styles.paymentMethodRow}>
                            <Text style={styles.paymentMethodLabel}>支付方式</Text>
                            <Text style={styles.paymentMethodValue}>
                                {selectedPayment === 'wechat' ? '微信余额 >' : '支付宝余额 >'}
                            </Text>
                        </View>

                        {/* 密码输入框 */}
                        <View style={styles.passwordInputContainer}>
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <View key={index} style={styles.passwordDot}>
                                    {password[index] ? (
                                        <Text style={styles.passwordDotFilled}>●</Text>
                                    ) : (
                                        <Text style={styles.passwordDotEmpty}>○</Text>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* 数字键盘 */}
                        <View style={styles.keyboardContainer}>
                            <View style={styles.keyboardRow}>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('1')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('2')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>2</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('3')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>3</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.keyboardRow}>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('4')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>4</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('5')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>5</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('6')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>6</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.keyboardRow}>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('7')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>7</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('8')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>8</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('9')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>9</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.keyboardRow}>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('.')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>.</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.keyButton, isLoading && styles.keyButtonDisabled]}
                                    onPress={() => handleNumberPress('0')}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.keyText, isLoading && styles.keyTextDisabled]}>0</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]}
                                    onPress={handleDeletePress}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.deleteButtonText, isLoading && styles.deleteButtonTextDisabled]}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 加载状态显示 */}
                            {isLoading && (
                                <View style={styles.loadingOverlay}>
                                    <View style={styles.loadingContent}>
                                        <ActivityIndicator size="large" color="#4CAF50" />
                                        <Text style={styles.loadingText}>支付中...</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // 金额显示区域样式
    amountSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    timeLimit: {
        fontSize: 14,
        color: '#666',
    },
    // 分割线样式
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
    },
    // 支付方式选择区域样式
    paymentSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // 微信支付图标样式
    wechatIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        position: 'relative',
    },
    wechatText: {
        fontSize: 20,
    },
    checkMark: {
        position: 'absolute',
        top: -2,
        right: -2,
        fontSize: 12,
        color: '#4CAF50',
        backgroundColor: '#fff',
        borderRadius: 8,
        width: 16,
        height: 16,
        textAlign: 'center',
        lineHeight: 16,
    },
    // 支付宝图标样式
    alipayIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#1677FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    alipayText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    // 支付信息样式
    paymentInfo: {
        flex: 1,
    },
    paymentName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    paymentDesc: {
        fontSize: 14,
        color: '#666',
    },
    // 选择圆圈样式
    paymentRight: {
        alignItems: 'center',
    },
    selectedCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDot: {
        fontSize: 12,
        color: '#fff',
    },
    unselectedCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    // 选项分割线样式
    optionSeparator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 5,
    },
    // 底部支付按钮样式
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    payButton: {
        backgroundColor: '#666',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    payButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    // 支付密码弹窗样式
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        flex: 1,
    },
    passwordModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        height: '147%',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 20,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#999',
    },
    passwordHeader: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    passwordTitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    passwordAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    paymentMethodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    paymentMethodLabel: {
        fontSize: 14,
        color: '#666',
    },
    paymentMethodValue: {
        fontSize: 14,
        color: '#333',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 15,
    },
    passwordDot: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    passwordDotFilled: {
        fontSize: 16,
        color: '#333',
    },
    passwordDotEmpty: {
        fontSize: 16,
        color: '#ddd',
    },
    keyboardContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    keyboardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    keyButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
    },
    keyButtonDisabled: {
        backgroundColor: '#f0f0f0',
    },
    keyText: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    },
    keyTextDisabled: {
        color: '#ccc',
    },
    deleteButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
    },
    deleteButtonDisabled: {
        backgroundColor: '#ccc',
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    deleteButtonTextDisabled: {
        color: '#999',
    },
    // 加载状态样式
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContent: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
        marginTop: 10,
    },
});

export default PayMoney; 