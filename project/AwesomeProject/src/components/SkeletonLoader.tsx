import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// {{ AURA-X: Add - 骨架屏属性接口. Approval: 骨架屏组件化设计需求. }}
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// {{ AURA-X: Add - 基础骨架元素组件. Approval: 骨架屏动画效果需求. }}
const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // {{ AURA-X: Add - 优化骨架屏动画效果. Approval: 性能优化需求. }}
  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800, // 减少动画时长
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animate();
    
    // 清理动画
    return () => {
      animatedValue.stopAnimation();
    };
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E8F4FD', '#F0F8FF'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// {{ AURA-X: Add - 首页骨架屏组件. Approval: 首页加载状态展示需求. }}
const HomeSkeletonLoader: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* {{ AURA-X: Add - 顶部导航骨架. Approval: 完整页面骨架屏需求. }} */}
      <View style={styles.header}>
        <Skeleton width={60} height={32} borderRadius={16} />
        <Skeleton width={120} height={24} borderRadius={12} />
        <Skeleton width={32} height={32} borderRadius={16} />
      </View>

      {/* {{ AURA-X: Add - 搜索栏骨架. Approval: 搜索功能骨架展示需求. }} */}
      <View style={styles.searchContainer}>
        <Skeleton width="100%" height={40} borderRadius={20} />
      </View>

      {/* {{ AURA-X: Add - 服务入口骨架. Approval: 6个服务入口骨架需求. }} */}
      <View style={styles.servicesSection}>
        <View style={styles.servicesGrid}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <View key={index} style={styles.serviceItem}>
              <Skeleton width={50} height={50} borderRadius={25} />
              <Skeleton width={60} height={12} borderRadius={6} style={styles.serviceText} />
              <Skeleton width={45} height={10} borderRadius={5} />
            </View>
          ))}
        </View>      
      </View>

      {/* {{ AURA-X: Add - 轮播图骨架. Approval: 轮播图加载状态需求. }} */}
      <View style={styles.carouselSection}>
        <Skeleton width={width - 32} height={120} borderRadius={12} />
        <View style={styles.dotsContainer}>
          {[1, 2, 3, 4, 5].map((index) => (
            <Skeleton key={index} width={6} height={6} borderRadius={3} style={styles.dot} />
          ))}
        </View>
      </View>

      {/* {{ AURA-X: Add - 医生推荐骨架. Approval: 医生卡片骨架展示需求. }} */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={80} height={18} borderRadius={9} />
        </View>
        
        {/* Tab栏骨架 */}
        <View style={styles.tabContainer}>
          <Skeleton width={80} height={32} borderRadius={16} />
          <Skeleton width={90} height={32} borderRadius={16} />
        </View>
        
        {/* 科室分类骨架 */}
        <View style={styles.tabContainer}>
          {['内科', '外科', '产科'].map((item, index) => (
            <Skeleton key={index} width={50} height={28} borderRadius={14} />
          ))}
        </View>

        {/* 医生卡片骨架 */}
        {[1, 2].map((index) => (
          <View key={index} style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={styles.doctorInfo}>
                <Skeleton width={80} height={16} borderRadius={8} />
                <Skeleton width={60} height={12} borderRadius={6} style={styles.doctorText} />
                <Skeleton width={120} height={12} borderRadius={6} style={styles.doctorText} />
                <Skeleton width={100} height={12} borderRadius={6} />
              </View>
              <Skeleton width={40} height={16} borderRadius={8} />
            </View>
            <View style={styles.doctorStats}>
              <Skeleton width={80} height={12} borderRadius={6} />
            </View>
            <View style={styles.doctorActions}>
              <Skeleton width="45%" height={36} borderRadius={18} />
              <Skeleton width="45%" height={36} borderRadius={18} />
            </View>
          </View>
        ))}
      </View>

      {/* {{ AURA-X: Add - 问诊动态骨架. Approval: 问答内容骨架展示需求. }} */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={80} height={18} borderRadius={9} />
        </View>
        
        <View style={styles.tabContainer}>
          <Skeleton width={100} height={32} borderRadius={16} />
        </View>

        {[1, 2].map((index) => (
          <View key={index} style={styles.qaCard}>
            <Skeleton width="90%" height={14} borderRadius={7} />
            <Skeleton width="75%" height={14} borderRadius={7} style={styles.qaText} />
            <Skeleton width="100%" height={12} borderRadius={6} style={styles.qaText} />
            <Skeleton width="60%" height={12} borderRadius={6} style={styles.qaText} />
            
            <View style={styles.qaFooter}>
              <View style={styles.doctorInfo}>
                <Skeleton width={60} height={12} borderRadius={6} />
                <Skeleton width={40} height={10} borderRadius={5} />
              </View>
              <Skeleton width={50} height={10} borderRadius={5} />
            </View>
          </View>
        ))}
      </View>

      {/* {{ AURA-X: Add - 热门文章骨架. Approval: 文章列表骨架展示需求. }} */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={80} height={18} borderRadius={9} />
        </View>
        
        <View style={styles.tabContainer}>
          {['女性健康', '心理健康'].map((item, index) => (
            <Skeleton key={index} width={70} height={28} borderRadius={14} />
          ))}
        </View>

        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.articleCard}>
            <Skeleton width={32} height={32} borderRadius={6} />
            <View style={styles.articleContent}>
              <Skeleton width="100%" height={14} borderRadius={7} />
              <Skeleton width="80%" height={14} borderRadius={7} style={styles.articleText} />
              <Skeleton width={60} height={12} borderRadius={6} style={styles.articleText} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// {{ AURA-X: Add - 骨架屏样式定义. Approval: 保持与首页设计一致的需求. }}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  servicesSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceText: {
    marginTop: 8,
    marginBottom: 2,
  },
  carouselSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    marginHorizontal: 3,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorText: {
    marginTop: 4,
  },
  doctorStats: {
    marginBottom: 12,
  },
  doctorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qaCard: {
    backgroundColor: '#FAFCFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  qaText: {
    marginTop: 8,
  },
  qaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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
  articleContent: {
    flex: 1,
    marginLeft: 12,
  },
  articleText: {
    marginTop: 8,
  },
});

export { Skeleton, HomeSkeletonLoader };
export default HomeSkeletonLoader; 