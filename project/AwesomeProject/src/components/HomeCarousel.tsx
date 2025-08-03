import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  ListRenderItem,
} from 'react-native';

const { width } = Dimensions.get('window');

// {{ AURA-X: Add - 轮播图数据类型定义. Approval: 组件化设计需求. }}
export interface CarouselItem {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  url?: string;
}

interface HomeCarouselProps {
  data: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  onItemPress?: (item: CarouselItem) => void;
}

const HomeCarousel: React.FC<HomeCarouselProps> = ({
  data,
  autoPlay = true,
  interval = 4000,
  onItemPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // {{ AURA-X: Add - 自动轮播逻辑. Approval: 用户需求中要求3-5秒自动切换. }}
  useEffect(() => {
    if (!autoPlay || data.length <= 1) return;

    const intervalId = setInterval(() => {
      const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      carouselRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, interval);

    return () => clearInterval(intervalId);
  }, [currentIndex, autoPlay, interval, data.length]);

  // {{ AURA-X: Add - 轮播项渲染函数. Approval: 组件化设计需求. }}
  const renderCarouselItem: ListRenderItem<CarouselItem> = ({ item }) => (
    <TouchableOpacity
      style={styles.carouselItem}
      activeOpacity={0.8}
      onPress={() => onItemPress?.(item)}
    >
      <View style={styles.carouselContent}>
        <Text style={styles.carouselEmoji}>{item.image}</Text>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // {{ AURA-X: Add - 处理滚动结束事件. Approval: 轮播图交互需求. }}
  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={carouselRef}
        data={data}
        renderItem={renderCarouselItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        removeClippedSubviews={true}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        keyExtractor={(item) => item.id}
      />
      
      {/* {{ AURA-X: Add - 轮播指示器. Approval: 用户体验需求. }} */}
      <View style={styles.dotsContainer}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
            onPress={() => {
              setCurrentIndex(index);
              carouselRef.current?.scrollToIndex({
                index,
                animated: true,
              });
            }}
          />
        ))}
      </View>
    </View>
  );
};

// {{ AURA-X: Add - 样式定义，保持与首页设计一致. Approval: 设计规范要求. }}
const styles = StyleSheet.create({
  container: {
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
    textAlign: 'center',
  },
  carouselSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  dotsContainer: {
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
});

export default HomeCarousel; 