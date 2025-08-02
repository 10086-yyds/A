import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';

const { width } = Dimensions.get('window');

// 文章详情页面组件
const ArticleDetail = ({ route, navigation }: any) => {
  // 从路由参数中获取文章数据
  console.log(route)
  const { article } = route.params || {};
  
  // 如果没有传递参数，显示默认内容
  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFE" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>文章详情</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>未找到文章内容</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFE" />
      
      {/* 现代化顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>文章详情</Text>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>
      
      {/* 文章内容区域 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 文章封面区域 */}
          <View style={styles.coverSection}>
            <View style={styles.coverImage}>
              <Text style={styles.coverEmoji}>📄</Text>
            </View>
            <View style={styles.coverOverlay}>
              <Text style={styles.categoryTag}>{getCategoryName(article.cate)}</Text>
            </View>
          </View>
          
          {/* 文章标题区域 */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.titleDivider} />
          </View>
          
          {/* 文章信息统计 */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statText}>{article.browse}次浏览</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏰</Text>
              <Text style={styles.statText}>刚刚</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statText}>0条评论</Text>
            </View>
          </View>
          
          {/* 文章内容 */}
          <View style={styles.articleContent}>
            <Text style={styles.contentText}>{article.content}</Text>
          </View>
          
          {/* 底部推荐区域 */}
          <View style={styles.recommendSection}>
            <Text style={styles.recommendTitle}>相关推荐</Text>
            <View style={styles.recommendCards}>
              <TouchableOpacity style={styles.recommendCard} activeOpacity={0.8}>
                <Text style={styles.recommendEmoji}>💡</Text>
                <Text style={styles.recommendText}>健康小贴士</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recommendCard} activeOpacity={0.8}>
                <Text style={styles.recommendEmoji}>🔬</Text>
                <Text style={styles.recommendText}>科学育儿</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 底部间距 */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
      
      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>👍</Text>
          <Text style={styles.actionText}>点赞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>评论</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>⭐</Text>
          <Text style={styles.actionText}>收藏</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareActionButton} activeOpacity={0.7}>
          <Text style={styles.shareActionText}>分享</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// 根据分类ID获取分类名称
const getCategoryName = (cate: number) => {
  const categoryMap = {
    0: '女性健康',
    1: '心理健康', 
    2: '科学备孕',
    3: '科学育儿'
  };
  return categoryMap[cate as keyof typeof categoryMap] || '未知分类';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FD',
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  backIcon: {
    fontSize: 18,
    color: '#2E86C1',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4F72',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  shareIcon: {
    fontSize: 16,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  coverSection: {
    position: 'relative',
    marginBottom: 20,
  },
  coverImage: {
    width: width - 32,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  coverEmoji: {
    fontSize: 60,
  },
  coverOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  categoryTag: {
    backgroundColor: '#2E86C1',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4F72',
    lineHeight: 32,
    marginBottom: 12,
  },
  titleDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#2E86C1',
    borderRadius: 2,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  articleContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    textAlign: 'justify',
  },
  recommendSection: {
    marginBottom: 20,
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4F72',
    marginBottom: 12,
  },
  recommendCards: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  recommendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 80,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F4FD',
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  actionText: {
    fontSize: 10,
    color: '#666',
  },
  shareActionButton: {
    backgroundColor: '#2E86C1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  shareActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop:10
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ArticleDetail; 