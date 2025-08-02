import React,{ useEffect,useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';

const { width } = Dimensions.get('window');
const DrugInfo = ({ route, navigation }: any) => {
    const { _id } = route.params
    const [drugInfo,setDrugInfo] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [showCartModal, setShowCartModal] = useState(false)
    const slideAnim = new Animated.Value(0)
    const cartSlideAnim = new Animated.Value(0)
    const [selectedSpec, setSelectedSpec] = useState('0.25g*12粒*2板')
    const [quantity, setQuantity] = useState(1)
    const getDrugInfo = async () => {
        const params ={
            _id:_id
        }
        const queryString = new URLSearchParams(params).toString()
        const url = `http://172.20.10.3:3000/Zjf/Info?${queryString}`
        try {
            const response = await fetch(url)
            if(response.ok){
                const data = await response.json()
                const processedData = data.data ? data.data[0] : data[0]
                if(processedData) {
                    const drugInfo = {
                        ...processedData,
                        image: processedData.image ? processedData.image.replace('localhost','172.20.10.3') : null
                    }
                    setDrugInfo(drugInfo)
                }
            }
        } catch(error) {
            console.error('获取商品详情失败:', error)
        }
    }
    useEffect(()=>{
        getDrugInfo();
    },[])

    const openModal = () => {
        setShowModal(true)
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowModal(false)
        })
    }

    const openCartModal = () => {
        setShowCartModal(true)
        Animated.timing(cartSlideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }

    const closeCartModal = () => {
        Animated.timing(cartSlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowCartModal(false)
        })
    }

    const handleQuantityChange = (type: 'increase' | 'decrease') => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1)
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1)
        }
    }

    const handleConfirm = async () => {
        try {
            // 创建购物车商品数据
            const cartItem = {
                _id: _id,
                name: drugInfo?.name,
                price: drugInfo?.price,
                image: drugInfo?.image,
                tag: drugInfo?.tag,
                quantity: quantity,
                spec: selectedSpec,
                timestamp: Date.now() // 添加时间戳用于唯一标识
            }

            // 获取现有的购物车数据
            const existingCartData = await AsyncStorage.getItem('cartItems')
            let cartItems = existingCartData ? JSON.parse(existingCartData) : []

            // 检查商品是否已存在
            const existingItemIndex = cartItems.findIndex((item: any) => item._id === _id && item.spec === selectedSpec)
            
            if (existingItemIndex !== -1) {
                // 如果商品已存在，更新数量
                cartItems[existingItemIndex].quantity += quantity
            } else {
                // 如果商品不存在，添加到购物车
                cartItems.push(cartItem)
            }

            // 保存到 AsyncStorage
            await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems))
            
            Alert.alert('成功', '商品已添加到购物车')
            
            // 导航到主应用，然后切换到购物车标签
            navigation.navigate('MainApp', {
                screen: 'Cart'
            })
            closeCartModal()
        } catch (error) {
            console.error('保存购物车数据失败:', error)
            Alert.alert('错误', '添加购物车失败，请重试')
        }
    }
        return (
        <View style={styles.container}>
            <Navbar
                title={'商品详情'}
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 商品图片区域 */}
                <View style={styles.imageContainer}>
                    {drugInfo?.image ? (
                        <Image source={{ uri: drugInfo.image }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.placeholderIcon}>🏔️</Text>
                        </View>
                    )}
                    <View style={styles.imageCounter}>
                        <Text style={styles.counterText}>1/9</Text>
                    </View>
                </View>

                {/* 价格和标签区域 */}
                <View style={styles.priceSection}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>¥{drugInfo?.price || '0'} 起</Text>
                        {drugInfo?.tag && (
                            <Text style={styles.tag}>{drugInfo.tag}</Text>
                        )}
                    </View>
                </View>

                {/* 商品名称和描述 */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{drugInfo?.name || '商品名称'}</Text>
                    <Text style={styles.productDesc}>
                        清热解毒 镇静 安神咽喉肿痛上呼吸道感染
                    </Text>
                </View>

                {/* 主治功能 */}
                <TouchableOpacity style={styles.infoRow} onPress={openModal}>
                    <Text style={styles.infoLabel}>主治</Text>
                    <Text style={styles.infoValue}>清热解毒,镇静安神。用于外感风热时毒、火毒...</Text>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                {/* 运费信息 */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>运费</Text>
                    <Text style={styles.infoValue}>运费8元,满99元包邮</Text>
                </View>

                {/* 服务保障 */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>服务</Text>
                    <View style={styles.serviceTags}>
                        <View style={styles.serviceTag}>
                            <Text style={styles.serviceTagText}>正品保证</Text>
                        </View>
                        <View style={styles.serviceTag}>
                            <Text style={styles.serviceTagText}>药监认证</Text>
                        </View>
                        <View style={styles.serviceTag}>
                            <Text style={styles.serviceTagText}>①不支持无理由退换</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* 底部操作栏 */}
            <View style={styles.bottomBar}>
                <View style={styles.leftActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>💬</Text>
                        <Text style={styles.actionText}>客服</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>🛒</Text>
                        <Text style={styles.actionText}>购物车</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.rightActions}>
                    <TouchableOpacity style={styles.addToCartButton} onPress={openCartModal}>
                        <Text style={styles.addToCartText}>加入购物车</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buyNowButton}>
                        <Text style={styles.buyNowText}>立即购买</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 底部弹出层 */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="none"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.modalBackdrop} 
                        onPress={closeModal}
                        activeOpacity={1}
                    />
                    <Animated.View 
                        style={[
                            styles.modalContent,
                            {
                                transform: [{
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [300, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>主治功能</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalText}>
                                清热解毒，镇静安神。用于外感风热时毒、火毒内盛所致的发热、烦躁、口渴、咽痛、舌红苔黄、脉数等症。
                            </Text>
                            <Text style={styles.modalText}>
                                本品具有以下功效：
                            </Text>
                            <Text style={styles.modalText}>
                                • 清热解毒：清除体内热毒，缓解发热症状
                            </Text>
                            <Text style={styles.modalText}>
                                • 镇静安神：安定心神，改善睡眠质量
                            </Text>
                            <Text style={styles.modalText}>
                                • 抗炎消肿：减轻咽喉肿痛，缓解上呼吸道感染
                            </Text>
                            <Text style={styles.modalText}>
                                • 抗菌消炎：抑制细菌生长，控制感染
                            </Text>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

            {/* 购物车弹出层 */}
            <Modal
                visible={showCartModal}
                transparent={true}
                animationType="none"
                onRequestClose={closeCartModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.modalBackdrop} 
                        onPress={closeCartModal}
                        activeOpacity={1}
                    />
                    <Animated.View 
                        style={[
                            styles.cartModalContent,
                            {
                                transform: [{
                                    translateY: cartSlideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [400, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        <View style={styles.cartModalHeader}>
                            <TouchableOpacity onPress={closeCartModal}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 商品信息 */}
                        <View style={styles.cartProductInfo}>
                            <View style={styles.cartProductImage}>
                                {drugInfo?.image ? (
                                    <Image source={{ uri: drugInfo.image }} style={styles.cartImage} resizeMode="cover" />
                                ) : (
                                    <View style={styles.cartImagePlaceholder}>
                                        <Text style={styles.placeholderIcon}>🏔️</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cartProductDetails}>
                                <Text style={styles.cartProductName}>{drugInfo?.name || '白云山 清开灵胶囊'}</Text>
                                <Text style={styles.cartProductSpec}>0.25g*12粒*2板 清热 解毒 镇静安神咽喉肿痛上呼吸道感染</Text>
                                <Text style={styles.cartProductPrice}>¥{drugInfo?.price || '14.5'}</Text>
                            </View>
                        </View>

                        <View style={styles.cartDivider} />

                        {/* 规格选择 */}
                        <View style={styles.cartSpecSection}>
                            <Text style={styles.cartSpecLabel}>规格</Text>
                            <View style={styles.cartSpecOptions}>
                                <TouchableOpacity 
                                    style={[
                                        styles.cartSpecOption,
                                        selectedSpec === '0.25g*12粒*2板' && styles.cartSpecOptionSelected
                                    ]}
                                    onPress={() => setSelectedSpec('0.25g*12粒*2板')}
                                >
                                    <Text style={[
                                        styles.cartSpecOptionText,
                                        selectedSpec === '0.25g*12粒*2板' && styles.cartSpecOptionTextSelected
                                    ]}>0.25g*12粒*2板</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.cartSpecOption,
                                        selectedSpec === '0.5g*12粒*1板' && styles.cartSpecOptionSelected
                                    ]}
                                    onPress={() => setSelectedSpec('0.5g*12粒*1板')}
                                >
                                    <Text style={[
                                        styles.cartSpecOptionText,
                                        selectedSpec === '0.5g*12粒*1板' && styles.cartSpecOptionTextSelected
                                    ]}>0.5g*12粒*1板</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.cartDivider} />

                        {/* 数量选择 */}
                        <View style={styles.cartQuantitySection}>
                            <View style={styles.cartQuantityLabel}>
                                <Text style={styles.cartQuantityText}>数量</Text>
                                <Text style={styles.cartStockText}>库存1289</Text>
                            </View>
                            <View style={styles.cartQuantitySelector}>
                                <TouchableOpacity 
                                    style={styles.cartQuantityButton}
                                    onPress={() => handleQuantityChange('decrease')}
                                >
                                    <Text style={styles.cartQuantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.cartQuantityValue}>{quantity}</Text>
                                <TouchableOpacity 
                                    style={styles.cartQuantityButton}
                                    onPress={() => handleQuantityChange('increase')}
                                >
                                    <Text style={styles.cartQuantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 确认按钮 */}
                        <TouchableOpacity style={styles.cartConfirmButton} onPress={handleConfirm}>
                            <Text style={styles.cartConfirmText}>确定</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
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
  // 图片区域样式
  imageContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
    color: '#ccc',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
  },
  // 价格区域样式
  priceSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  tag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  // 商品信息样式
  productInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // 信息行样式
  infoRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  arrow: {
    fontSize: 16,
    color: '#999',
    marginLeft: 10,
  },
  // 服务标签样式
  serviceTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 10,
  },
  serviceTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#666',
  },
  // 底部操作栏样式
  bottomBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  leftActions: {
    flexDirection: 'row',
    flex: 1,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  rightActions: {
    flexDirection: 'row',
  },
  addToCartButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  addToCartText: {
    fontSize: 14,
    color: '#333',
  },
  buyNowButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buyNowText: {
    fontSize: 14,
    color: '#fff',
  },
  // 弹出层样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height:"140%"
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
    padding: 5,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  // 购物车弹出层样式
  cartModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    height:"150%"
  },
  cartModalHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cartProductInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cartProductImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartProductDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cartProductSpec: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 5,
  },
  cartProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  cartDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 20,
  },
  cartSpecSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cartSpecLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cartSpecOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  cartSpecOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cartSpecOptionSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  cartSpecOptionText: {
    fontSize: 12,
    color: '#666',
  },
  cartSpecOptionTextSelected: {
    color: '#fff',
  },
  cartQuantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cartQuantityLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartQuantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  cartStockText: {
    fontSize: 12,
    color: '#999',
  },
  cartQuantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  cartQuantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cartQuantityButtonText: {
    fontSize: 16,
    color: '#333',
  },
  cartQuantityValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  cartConfirmButton: {
    backgroundColor: '#333',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DrugInfo; 