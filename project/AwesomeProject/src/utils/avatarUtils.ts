import { ImageSourcePropType } from 'react-native';

/**
 * 头像资源管理工具
 */
export class AvatarUtils {
  // 默认本地头像
  static defaultLocalAvatar = require('../images/1.jpg');
  
  /**
   * 获取头像资源
   * @param avatarPath 头像路径或标识符
   * @returns 图片资源对象
   */
  static getAvatarSource(avatarPath: string | null | undefined): ImageSourcePropType | { uri: string } {
    // 如果没有头像路径或是本地默认标识符，使用本地图片
    if (!avatarPath || avatarPath === 'local_default') {
      return this.defaultLocalAvatar;
    }
    
    // 如果是网络URL，返回uri对象
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return { uri: avatarPath };
    }
    
    // 如果是其他格式，也尝试作为网络地址处理
    return { uri: avatarPath };
  }
  
  /**
   * 检查是否为本地头像
   * @param avatarPath 头像路径
   * @returns 是否为本地头像
   */
  static isLocalAvatar(avatarPath: string | null | undefined): boolean {
    return !avatarPath || avatarPath === 'local_default';
  }
  
  /**
   * 设置默认头像标识符
   * @returns 本地默认头像标识符
   */
  static getDefaultAvatarIdentifier(): string {
    return 'local_default';
  }
} 