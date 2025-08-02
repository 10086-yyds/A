import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';

// {{ AURA-X: Add - 服务项数据类型定义. Approval: 组件化设计需求. }}
export interface ServiceItem {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  color: string;
  badge?: string;
  isEnabled?: boolean;
}

interface ServiceGridProps {
  services: ServiceItem[];
  columns?: number;
  onServicePress?: (service: ServiceItem) => void;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  columns = 3,
  onServicePress,
}) => {
  // {{ AURA-X: Add - 服务项渲染函数. Approval: 用户需求中要求6个核心功能入口. }}
  const renderServiceItem: ListRenderItem<ServiceItem> = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      activeOpacity={0.7}
      onPress={() => onServicePress?.(item)}
      disabled={item.isEnabled === false}
    >
      <View style={[
        styles.serviceIcon,
        { backgroundColor: item.color + '20' },
        item.isEnabled === false && styles.disabledIcon
      ]}>
        <Text style={styles.serviceEmoji}>{item.icon}</Text>
        {item.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      
      <Text style={[
        styles.serviceName,
        item.isEnabled === false && styles.disabledText
      ]}>
        {item.name}
      </Text>
      
      {item.subtitle && (
        <Text style={[
          styles.serviceSubtitle,
          item.isEnabled === false && styles.disabledText
        ]}>
          {item.subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        numColumns={columns}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        key={columns} // 确保列数改变时重新渲染
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

// {{ AURA-X: Add - 样式定义，保持与首页设计一致. Approval: 设计规范要求. }}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  gridContainer: {
    alignItems: 'flex-start',
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  disabledIcon: {
    backgroundColor: '#F5F5F5',
  },
  serviceEmoji: {
    fontSize: 24,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  disabledText: {
    color: '#999',
  },
});

export default ServiceGrid; 