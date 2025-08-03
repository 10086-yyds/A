import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// {{ AURA-X: Add - 问答数据类型定义. Approval: 组件化设计需求. }}
export interface QAItem {
  id: string;
  question: string;
  answer: string;
  doctorName: string;
  doctorTitle?: string;
  doctorAvatar?: string;
  time: string;
  replies: number;
  likes?: number;
  isLiked?: boolean;
  tags?: string[];
  category?: string;
}

interface QACardProps {
  qaItem: QAItem;
  onCardPress?: (qaItem: QAItem) => void;
  onDoctorPress?: (doctorName: string) => void;
  onLikePress?: (qaItem: QAItem) => void;
  showFullAnswer?: boolean;
}

const QACard: React.FC<QACardProps> = ({
  qaItem,
  onCardPress,
  onDoctorPress,
  onLikePress,
  showFullAnswer = false,
}) => {
  // {{ AURA-X: Add - 处理答案显示长度. Approval: 用户体验优化需求. }}
  const displayAnswer = showFullAnswer 
    ? qaItem.answer 
    : qaItem.answer.length > 50 
      ? qaItem.answer.substring(0, 50) + '...' 
      : qaItem.answer;

  return (
    <TouchableOpacity
      style={styles.qaCard}
      activeOpacity={0.8}
      onPress={() => onCardPress?.(qaItem)}
    >
      {/* {{ AURA-X: Add - 问题区域. Approval: 用户需求中要求展示用户问题. }} */}
      <View style={styles.questionContainer}>
        {qaItem.category && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{qaItem.category}</Text>
          </View>
        )}
        <Text style={styles.qaQuestion}>Q: {qaItem.question}</Text>
      </View>

      {/* {{ AURA-X: Add - 回答区域. Approval: 用户需求中要求展示医生简要回答. }} */}
      <View style={styles.answerContainer}>
        <Text style={styles.qaAnswer}>A: {displayAnswer}</Text>
        {!showFullAnswer && qaItem.answer.length > 50 && (
          <TouchableOpacity onPress={() => onCardPress?.(qaItem)}>
            <Text style={styles.expandText}>展开全部</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* {{ AURA-X: Add - 标签区域. Approval: 内容分类展示需求. }} */}
      {qaItem.tags && qaItem.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {qaItem.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* {{ AURA-X: Add - 底部信息区域. Approval: 用户需求中要求显示医生信息和统计数据. }} */}
      <View style={styles.qaFooter}>
        <TouchableOpacity
          style={styles.doctorInfo}
          onPress={() => onDoctorPress?.(qaItem.doctorName)}
          activeOpacity={0.7}
        >
          {qaItem.doctorAvatar && (
            <Text style={styles.doctorAvatar}>{qaItem.doctorAvatar}</Text>
          )}
          <View>
            <Text style={styles.qaDoctorName}>{qaItem.doctorName}</Text>
            {qaItem.doctorTitle && (
              <Text style={styles.doctorTitle}>{qaItem.doctorTitle}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.qaTime}>{qaItem.time}</Text>
          <Text style={styles.qaReplies}>{qaItem.replies}条回答</Text>
          
          {qaItem.likes !== undefined && (
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => onLikePress?.(qaItem)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.likeIcon,
                qaItem.isLiked && styles.likedIcon
              ]}>
                {qaItem.isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={styles.likeCount}>{qaItem.likes}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// {{ AURA-X: Add - 样式定义，保持与首页设计一致. Approval: 设计规范要求. }}
const styles = StyleSheet.create({
  qaCard: {
    backgroundColor: '#FAFCFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F4FD',
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionContainer: {
    marginBottom: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#2E86C1',
    fontWeight: '500',
  },
  qaQuestion: {
    fontSize: 14,
    color: '#1B4F72',
    fontWeight: '500',
    lineHeight: 20,
  },
  answerContainer: {
    marginBottom: 12,
  },
  qaAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  expandText: {
    fontSize: 12,
    color: '#2E86C1',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  tagText: {
    fontSize: 10,
    color: '#2E86C1',
  },
  qaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    fontSize: 20,
    marginRight: 6,
  },
  qaDoctorName: {
    fontSize: 12,
    color: '#2E86C1',
    fontWeight: '500',
  },
  doctorTitle: {
    fontSize: 10,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qaTime: {
    fontSize: 11,
    color: '#999',
  },
  qaReplies: {
    fontSize: 11,
    color: '#27AE60',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  likeIcon: {
    fontSize: 12,
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  likeCount: {
    fontSize: 11,
    color: '#666',
  },
});

export default QACard; 