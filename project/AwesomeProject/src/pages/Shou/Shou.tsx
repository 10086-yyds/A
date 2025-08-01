import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AvatarUtils } from '../../utils/avatarUtils';
const { width } = Dimensions.get('window');

// 模拟数据类型定义
interface Doctor {
  _id: string;
  realName: string;
  title: string;
  hospital: string;
  specialty: string;
  consultations: number;
  rating: number;
  avatar: string;
}

interface Article {
  _id: string;
  title: string;
  browse:string;
  content:string;
  cate:number;
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
  doctorName: string;
  time: string;
  replies: number;
}

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  url: string;
}

const Shou = ({ navigation }: any) => {
  const [selectedCity, setSelectedCity] = useState('北京');
  const [searchText, setSearchText] = useState('');
  const [selectedDoctorTab, setSelectedDoctorTab] = useState('优选医生');
  const [selectedDepartment, setSelectedDepartment] = useState('内科');
  const [selectedArticleTab, setSelectedArticleTab] = useState('女性健康');
  const [selectedQATab, setSelectedQATab] = useState('最新免费问诊');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  
  const carouselRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [articleData , setArticleData] = useState([])
  const [doctor, setDoctor] = useState([])
  // {{ AURA-X: Add - 模拟数据，实际项目中应从API获取. Approval: 用户需求确认. }}
  // 轮播图数据
  const carouselData: CarouselItem[] = [
    { id: '1', image: '🏥', title: '专业医疗服务', url: '/health-service' },
    { id: '2', image: '👨‍⚕️', title: '优质医生资源', url: '/doctors' },
    { id: '3', image: '💊', title: '便民购药服务', url: '/pharmacy' },
    { id: '4', image: '📱', title: 'AI智能问诊', url: '/ai-consult' },
    { id: '5', image: '🔬', title: '健康体检预约', url: '/checkup' },
  ];

  // 功能入口数据
  const services = [
    { id: '1', name: '极速问诊', subtitle: 'AI秒回', icon: '⚡', color: '#FF6B6B' },
    { id: '2', name: '在线问诊', subtitle: '医生坐诊开方', icon: '👨‍⚕️', color: '#4ECDC4' },
    { id: '3', name: '找医生', subtitle: '全国医生资源', icon: '🔍', color: '#45B7D1' },
    { id: '4', name: '免费问诊', subtitle: '限时免费', icon: '🎁', color: '#96CEB4' },
    { id: '5', name: '预约挂号', subtitle: '快速预约', icon: '📅', color: '#FECA57' },
    { id: '6', name: '线上购药', subtitle: '送药到家', icon: '💊', color: '#FF9FF3' },
  ];



  // 科室分类
  const departments = ['内科', '外科', '产科', '儿科', '皮肤科', '心理科'];
  // 文章分类映射
  const categoryMap = {
    0: '女性健康',
    1: '心理健康', 
    2: '科学备孕',
    3: '科学育儿'
  };

  // 根据cate字段过滤文章
  const getFilteredArticles = () => {
    if (!articleData || articleData.length === 0) return [];
    
    const selectedCategoryIndex = articleCategories.indexOf(selectedArticleTab);
    const filtered = articleData.filter((article: Article) => article.cate === selectedCategoryIndex);
    
    console.log(`过滤文章 - 分类: ${selectedArticleTab}, 索引: ${selectedCategoryIndex}, 结果数量: ${filtered.length}`);
    
    return filtered;
  };

  const getArticle = async () => {
    try {
      const res = await axios.get('http://192.168.182.146:3000/Wxy/getArticle');
      setArticleData(res.data);
      console.log('获取文章成功:', res.data);
    } catch (error) {
      console.error('获取文章失败:', error);
    }
  }
  const getDoctor = async () => {
    try {
      const docres = await axios.get('http://192.168.182.146:3000/Wxy/getDoctor')
      setDoctor(docres.data)
      console.log("获取医生列表成功",docres.data)
    } catch (error) {
      console.error('获取医生失败:', error);
    }
  }
  useEffect(() => {
    getArticle();
    getDoctor();
  }, [])

  // 问答数据
  const qaData: QAItem[] = [
    {
      id: '1',
      question: '最近总是失眠，应该如何调理？',
      answer: '建议规律作息，睡前避免刺激性食物...',
      doctorName: '王医生',
      time: '2小时前',
      replies: 12
    },
    {
      id: '2',
      question: '孩子发烧38.5度，需要立即就医吗？',
      answer: '建议物理降温，观察精神状态...',
      doctorName: '李医生',
      time: '1小时前',
      replies: 8
    },
  ];

  // 文章分类
  const articleCategories = ['女性健康', '心理健康', '科学备孕', '科学育儿'];

  // {{ AURA-X: Add - 处理服务点击事件. Approval: 用户需求中要求点击极速问诊跳转AI界面. }}
  const handleServicePress = (service: any) => {
    switch (service.id) {
      case '1': // 极速问诊
        navigation.navigate('AiConsult');
        break;
      case '2': // 在线问诊
        // 可以跳转到在线问诊页面
        console.log('跳转到在线问诊');
        break;
      case '3': // 找医生
        // 可以跳转到找医生页面
        console.log('跳转到找医生');
        break;
      default:
        console.log(`点击了服务: ${service.name}`);
    }
  };

  // {{ AURA-X: Add - 轮播图自动切换逻辑. Approval: 用户需求中要求3-5秒自动切换. }}
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentCarouselIndex < carouselData.length - 1) {
        setCurrentCarouselIndex(currentCarouselIndex + 1);
        carouselRef.current?.scrollToIndex({
          index: currentCarouselIndex + 1,
          animated: true,
        });
      } else {
        setCurrentCarouselIndex(0);
        carouselRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      }
    }, 4000); // 4秒切换间隔

    return () => clearInterval(interval);
  }, [currentCarouselIndex]);

  // {{ AURA-X: Add - 轮播图渲染组件. Approval: 用户需求中要求轮播图功能. }}
  const renderCarouselItem = ({ item }: { item: CarouselItem }) => (
    <TouchableOpacity style={styles.carouselItem} activeOpacity={0.8}>
      <View style={styles.carouselContent}>
        <Text style={styles.carouselEmoji}>{item.image}</Text>
        <Text style={styles.carouselTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  // {{ AURA-X: Add - 服务入口渲染组件. Approval: 用户需求中要求6个核心功能入口. }}
  const renderServiceItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.serviceItem} 
      activeOpacity={0.7}
      onPress={() => handleServicePress(item)}
    >
      <View style={[styles.serviceIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.serviceEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  // {{ AURA-X: Add - 医生卡片渲染组件. Approval: 用户需求中要求展示医生信息. }}
  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <Text style={styles.doctorAvatar}>{item.avatar}</Text>
        <View style={styles.doctorInfo}>
          <View style={styles.doctorNameRow}>
            <Text style={styles.doctorName}>{item.realName}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.doctorTitle}>{item.title}</Text>
          <Text style={styles.doctorHospital}>{item.hospital}</Text>
          <Text style={styles.doctorSpecialty}>擅长：{item.specialty}</Text>
        </View>
      </View>
      <View style={styles.doctorStats}>
        <Text style={styles.consultationCount}>接诊 {item.consultations}次</Text>
      </View>
      <View style={styles.doctorActions}>
        <TouchableOpacity 
          style={styles.consultButton} 
          activeOpacity={0.8}
          onPress={async () => {
            try {
              const username = await AsyncStorage.getItem('userName') || "甜甜";
              const userAvatar = await AsyncStorage.getItem('userAvatar') || AvatarUtils.getDefaultAvatarIdentifier();
              navigation.navigate('LineLiao', { username, userAvatar, item });
            } catch (error) {
              console.error('获取用户信息失败:', error);
              // 使用默认值
              navigation.navigate('LineLiao', { 
                username: "甜甜", 
                userAvatar: AvatarUtils.getDefaultAvatarIdentifier(),
                item
              });
            }
          }}
        >
          <Text style={styles.consultButtonText}>在线问诊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.appointmentButton} activeOpacity={0.8}>
          <Text style={styles.appointmentButtonText}>预约挂号</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // {{ AURA-X: Add - 问答卡片渲染组件. Approval: 用户需求中要求展示问诊动态. }}
  const renderQAItem = ({ item }: { item: QAItem }) => (
    <TouchableOpacity style={styles.qaCard} activeOpacity={0.8}>
      <Text style={styles.qaQuestion}>Q: {item.question}</Text>
      <Text style={styles.qaAnswer}>A: {item.answer}</Text>
      <View style={styles.qaFooter}>
        <Text style={styles.qaDoctorName}>{item.doctorName}</Text>
        <Text style={styles.qaTime}>{item.time}</Text>
        <Text style={styles.qaReplies}>{item.replies}条回答</Text>
      </View>
    </TouchableOpacity>
  );

  // {{ AURA-X: Add - 文章卡片渲染组件. Approval: 用户需求中要求展示热门文章. }}
  const renderArticleItem = ({ item }: { item: Article }) => (
    <TouchableOpacity 
    style={styles.articleCard} 
    activeOpacity={0.8}
    onPress={() => {
      // 跳转到文章详情页面，传递文章数据
      navigation.navigate('ArticleDetail', { article: item });
    }}
    >
      <Text style={styles.articleEmoji}>📄</Text>
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.articleFooter}>
          <Text style={styles.articleViews}>{item.browse}次浏览</Text>
          <Text style={styles.articleCategory}>{categoryMap[item.cate as keyof typeof categoryMap]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // {{ AURA-X: Add - Tab切换组件. Approval: 用户需求中要求多个Tab切换功能. }}
  const renderTabBar = (tabs: string[], selectedTab: string, onTabPress: (tab: string) => void) => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, selectedTab === tab && styles.activeTab]}
          onPress={() => onTabPress(tab)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFE" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        
        {/* {{ AURA-X: Add - 顶部导航区域. Approval: 用户需求中要求显示城市选择和APP标题. }} */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.citySelector} activeOpacity={0.7}>
            <Text style={styles.cityText}>{selectedCity}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.appTitle}>妙医在线</Text>
          <TouchableOpacity style={styles.messageIcon} activeOpacity={0.7}>
            <Text style={styles.messageEmoji}>💬</Text>
          </TouchableOpacity>
        </View>

        {/* {{ AURA-X: Add - 搜索栏. Approval: 用户需求中要求支持搜索多种内容. }} */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索医生、医院、药品、疾病、医学文章"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* {{ AURA-X: Add - 功能入口区域. Approval: 用户需求中要求展示6个核心功能. }} */}
        <View style={styles.servicesSection}>
          <FlatList
            data={services}
            renderItem={renderServiceItem}
            numColumns={3}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* {{ AURA-X: Add - 轮播图区域. Approval: 用户需求中要求自动轮播功能. }} */}
        <View style={styles.carouselSection}>
          <FlatList
            ref={carouselRef}
            data={carouselData}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentCarouselIndex(index);
            }}
          />
          <View style={styles.carouselDots}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentCarouselIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* {{ AURA-X: Add - 医生推荐区域. Approval: 用户需求中要求分优选医生和本地好医生. }} */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>医生推荐</Text>
          </View>
          
          {renderTabBar(['优选医生', '本地好医生'], selectedDoctorTab, setSelectedDoctorTab)}
          
          {renderTabBar(departments, selectedDepartment, setSelectedDepartment)}
          
          <FlatList
            data={doctor}
            renderItem={renderDoctorCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无医生信息</Text>
              </View>
            )}
          />
        </View>

        {/* {{ AURA-X: Add - 问诊动态区域. Approval: 用户需求中要求展示最新免费问诊. }} */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>问诊动态</Text>
          </View>
          
          {renderTabBar(['最新免费问诊'], selectedQATab, setSelectedQATab)}
          
          <FlatList
            data={qaData}
            renderItem={renderQAItem}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* {{ AURA-X: Add - 热门文章区域. Approval: 用户需求中要求按健康主题分类展示. }} */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>热门文章</Text>
          </View>
          
          {renderTabBar(articleCategories, selectedArticleTab, setSelectedArticleTab)}
          
          <FlatList
            data={getFilteredArticles()}
            renderItem={renderArticleItem}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无{selectedArticleTab}相关文章</Text>
              </View>
            )}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// {{ AURA-X: Add - 样式定义，采用浅蓝、白色主色调设计. Approval: 用户需求中明确要求的色调和设计风格. }}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE', // 浅蓝白色背景
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FD',
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
  },
  cityText: {
    fontSize: 14,
    color: '#2E86C1',
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#2E86C1',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4F72',
  },
  messageIcon: {
    padding: 4,
  },
  messageEmoji: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  servicesSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontSize: 10,
    color: '#666',
  },
  carouselSection: {
    marginBottom: 8,
  },
  carouselItem: {
    width: width - 32,
    height: 120,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  carouselContent: {
    alignItems: 'center',
  },
  carouselEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B4F72',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BDC3C7',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#2E86C1',
    width: 16,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4F72',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFE',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2E86C1',
    fontWeight: '600',
  },
  doctorCard: {
    backgroundColor: '#FAFCFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4F72',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#F39C12',
    fontWeight: '600',
  },
  doctorTitle: {
    fontSize: 13,
    color: '#2E86C1',
    marginBottom: 2,
  },
  doctorHospital: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
  },
  doctorStats: {
    marginBottom: 12,
  },
  consultationCount: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  doctorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  consultButton: {
    flex: 1,
    backgroundColor: '#2E86C1',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  consultButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  appointmentButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E86C1',
  },
  appointmentButtonText: {
    color: '#2E86C1',
    fontSize: 13,
    fontWeight: '600',
  },
  qaCard: {
    backgroundColor: '#FAFCFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  qaQuestion: {
    fontSize: 14,
    color: '#1B4F72',
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  qaAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  qaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qaDoctorName: {
    fontSize: 12,
    color: '#2E86C1',
    fontWeight: '500',
  },
  qaTime: {
    fontSize: 11,
    color: '#999',
  },
  qaReplies: {
    fontSize: 11,
    color: '#27AE60',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  articleEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 14,
    color: '#1B4F72',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  articleViews: {
    fontSize: 12,
    color: '#999',
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleCategory: {
    fontSize: 11,
    color: '#2E86C1',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default Shou; 