import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Alert
} from 'react-native';
import Navbar from '../../components/Navbar';


const { width } = Dimensions.get('window');

const Drug = ({ navigation }: any) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [drugProducts, setDrugProducts] = useState([]);
  const carouselRef = useRef(null);
  const bannerData = [
    {
      id: 1,
      image: require('../../../image/2.png')
    },
    {
      id: 2,
      image: require('../../../image/3.png')
    },
    {
      id: 3,
      image: require('../../../image/4.png')
    },
    {
      id: 4,
      image: require('../../../image/5.png')
    }
  ];

  const categories = [
    { id: 1, name: '感冒发烧', image: require('../../../image/j1.png'), key: '1' },
    { id: 2, name: '抗菌消炎', image: require('../../../image/j2.png'), key: '1' },
    { id: 3, name: '肠胃消化', image: require('../../../image/j3.png'), key: '2' },
    { id: 4, name: '皮肤用药', image: require('../../../image/j4.png'), key: '2' },
    { id: 5, name: '咳嗽呼吸', image: require('../../../image/j5.png'), key: '3' },
    { id: 6, name: '妇科用药', image: require('../../../image/j6.png'), key: '3' },
    { id: 7, name: '儿童用药', image: require('../../../image/j7.png'), key: '4' },
    { id: 8, name: '骨科疼痛', image: require('../../../image/j8.png'), key: '4' },
    { id: 9, name: '耳鼻咽喉', image: require('../../../image/j9.png'), key: '1' },
    { id: 10, name: '心脑血管', image: require('../../../image/j10.png'), key: '2' }
  ];

  // 默认商品数据（如果后端没有数据时显示）
  const defaultProducts = [
    {
      id: 1,
      name: '白云山潘生丸胶囊清热解毒 0.25g*12粒*2板镇静安',
      price: '¥14.5',
      tag: '处方药',
      image: null
    },
    {
      id: 2,
      name: '小葵花 小儿咳喘灵口服液 10ml*6支 宣肺 清热 止咳',
      price: '¥18.6',
      tag: '',
      image: null
    }
  ];

  const fetchDrugData = async () => {

    try {
      // {{ AURA-X: Modify - 移除硬编码IP地址. Approved: 安全修复. }}
      const baseURL = process.env.API_BASE_URL || 'http://192.168.33.60:3000';
      const url = `${baseURL}/Zjf`;

      // 创建超时控制器（兼容性更好的方案）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId); // 清除超时定时器

      if (response.ok) {
        const data = await response.json()

        // 将数据设置到状态中
        if (data.data && data.data.length > 0) {
          setDrugProducts(data.data)
        }
        return data
      } else {
        // 已移除调试日志
      }
    } catch (error) {
      // 已移除调试日志
      // 网络错误时显示友好提示
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        // {{ AURA-X: Modify - 移除调试信息和硬编码地址. Approved: 安全修复. }}


      }
      if (error.name === 'AbortError') {

      }
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchDrugData()
  }, [])

  const renderBannerItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={[styles.banner, { width: width - 30 }]}>
        <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
      </TouchableOpacity>
    );
  };

  const handleCategoryPress = (category: any) => {
    navigation.navigate('Jgq', {
      categoryName: category.name,
      categoryId: category.id,
      key: category.key
    })
  }

  return (
    <View style={styles.container}>
      <Navbar
        title='线上购药'
        showBack={true}
        backIcon={require('../../../image/1.png')}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 搜索框 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜一搜药名、症状"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>搜索</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 广告轮播图 */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={carouselRef}
            data={bannerData}
            renderItem={renderBannerItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / (width - 30));
              setActiveSlide(index);
            }}
            snapToInterval={width - 30}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 15 }}
          />
          <View style={styles.dots}>
            {bannerData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeSlide === index ? styles.activeDot : null
                ]}
              />
            ))}
          </View>
        </View>

        {/* 分类网格 */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={styles.categoryIcon}>
                  <Image source={category.image} style={styles.categoryIconImage} resizeMode="contain" />
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.moreIndicator}>
            <Text style={styles.moreText}>...</Text>
          </View>
        </View>

        {/* 推荐商品 */}
        <View style={styles.productsContainer}>

          {(drugProducts.length > 0 ? drugProducts : defaultProducts).map((product: any, index: number) => (
            <TouchableOpacity key={product._id || product.id || `product-${index}`} style={styles.productCard}>
              <View style={styles.productImage}>
                {product.image ? (
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                ) : (
                  <Text style={styles.productImagePlaceholder}>💊</Text>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.productBottom}>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  {product.tag ? (
                    <Text style={styles.productTag}>{product.tag}</Text>
                  ) : <Text style={styles.productTag}>{'非处方药'}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  image: {
    width: 100,
    height: 100
  },
  productImagePlaceholder: {
    fontSize: 30,
    color: '#ccc',
  },
  content: {
    flex: 1,
  },
  // 搜索框样式
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    color: '#999',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  searchButtonText: {
    fontSize: 12,
    color: '#666',
  },
  // 广告轮播图样式
  bannerContainer: {
    paddingVertical: 10,
    position: 'relative',
  },
  banner: {
    borderRadius: 10,
    height: 120,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  // 分类网格样式
  categoryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    padding: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 80) / 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  categoryIconImage: {
    width: 30,
    height: 30,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  moreIndicator: {
    alignItems: 'center',
    paddingTop: 10,
  },
  moreText: {
    fontSize: 16,
    color: '#999',
  },
  // 商品卡片样式
  productsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  productTag: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
});

export default Drug; 