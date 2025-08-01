import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// {{ AURA-X: Add - 医生数据类型定义. Approval: 组件化设计需求. }}
export interface Doctor {
  id: string;
  name: string;
  title: string;
  hospital: string;
  specialty: string;
  consultations: number;
  rating: number;
  avatar: string;
  department?: string;
  price?: number;
  isOnline?: boolean;
}

interface DoctorCardProps {
  doctor: Doctor;
  onConsultPress?: (doctor: Doctor) => void;
  onAppointmentPress?: (doctor: Doctor) => void;
  onCardPress?: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onConsultPress,
  onAppointmentPress,
  onCardPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.doctorCard}
      activeOpacity={0.8}
      onPress={() => onCardPress?.(doctor)}
    >
      {/* {{ AURA-X: Add - 医生头像和基本信息区域. Approval: 用户需求中要求展示医生详细信息. }} */}
      <View style={styles.doctorHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.doctorAvatar}>{doctor.avatar}</Text>
          {doctor.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.doctorInfo}>
          <View style={styles.doctorNameRow}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{doctor.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.doctorTitle}>{doctor.title}</Text>
          <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
          <Text style={styles.doctorSpecialty}>擅长：{doctor.specialty}</Text>
          
          {doctor.department && (
            <View style={styles.departmentTag}>
              <Text style={styles.departmentText}>{doctor.department}</Text>
            </View>
          )}
        </View>
      </View>

      {/* {{ AURA-X: Add - 统计信息区域. Approval: 用户需求中要求显示接诊量等重要信息. }} */}
      <View style={styles.doctorStats}>
        <View style={styles.statItem}>
          <Text style={styles.consultationCount}>接诊 {doctor.consultations}次</Text>
          {doctor.price && (
            <Text style={styles.priceText}>问诊费 ¥{doctor.price}</Text>
          )}
        </View>
      </View>

      {/* {{ AURA-X: Add - 操作按钮区域. Approval: 用户需求中要求在线问诊和预约挂号按钮. }} */}
      <View style={styles.doctorActions}>
        <TouchableOpacity
          style={[styles.consultButton, !doctor.isOnline && styles.disabledButton]}
          activeOpacity={0.8}
          onPress={() => onConsultPress?.(doctor)}
          disabled={!doctor.isOnline}
        >
          <Text style={[styles.consultButtonText, !doctor.isOnline && styles.disabledButtonText]}>
            {doctor.isOnline ? '在线问诊' : '离线'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.appointmentButton}
          activeOpacity={0.8}
          onPress={() => onAppointmentPress?.(doctor)}
        >
          <Text style={styles.appointmentButtonText}>预约挂号</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// {{ AURA-X: Add - 样式定义，保持与首页设计一致. Approval: 设计规范要求. }}
const styles = StyleSheet.create({
  doctorCard: {
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
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  doctorAvatar: {
    fontSize: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27AE60',
    borderWidth: 1,
    borderColor: 'white',
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
    fontWeight: '500',
  },
  doctorHospital: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  departmentTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  departmentText: {
    fontSize: 10,
    color: '#2E86C1',
    fontWeight: '500',
  },
  doctorStats: {
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consultationCount: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
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
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  consultButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#7F8C8D',
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
});

export default DoctorCard; 