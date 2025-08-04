import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import request from '../../api/request';

interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  lastLoginTime?: string;
}

interface LoginResponse {
  code: number;
  msg: string;
  data: {
    id: string;
    username: string;
    realName?: string;
    email?: string;
    phone?: string;
    role?: any;
    permissions?: string[];
    token: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从本地存储加载用户信息
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // 验证token是否仍然有效
        await validateToken(storedToken);
      }
    } catch (error) {
      // 已移除调试日志
    } finally {
      setIsLoading(false);
    }
  };

  // 验证token有效性
  const validateToken = async (token: string) => {
    try {
      const response = await request({
        method: 'GET',
        url: '/users/profile',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const responseData = response.data as any;
      if (response.status === 200 && responseData.success) {
        // token有效，更新用户信息
        setUser(responseData.data);
        await AsyncStorage.setItem('userData', JSON.stringify(responseData.data));
      }
    } catch (error) {
      // token无效，清除本地存储

      await logout();
    }
  };

  // 登录函数
  const login = async (username: string, password: string): Promise<{ success: boolean, message?: string }> => {
    try {
      const response = await request({
        method: 'POST',
        url: '/users/login',
        data: {
          username,
          password
        }
      });

      const responseData = response.data as any;
      
      if (response.status === 200 && responseData.success) {
        const userData = responseData.data.user;
        const userToken = responseData.data.token;

        // 保存到状态
        setUser(userData);
        setToken(userToken);

        // {{ AURA-X: Modify - 改进token存储安全性. Approved: 安全修复. }}
        // 保存到本地存储 - 注意：生产环境应使用更安全的存储方式
        // TODO: 考虑使用 react-native-keychain 或 Expo SecureStore
        await AsyncStorage.setItem('userToken', userToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        return { success: true };
      } else {
        return {
          success: false,
          message: responseData.message || '登录失败'
        };
      }
    } catch (error: any) {
      // 已移除调试日志
      return {
        success: false,
        message: error.response?.data?.message || '网络错误，请重试'
      };
    }
  };

  // 登出函数
  const logout = async () => {
    try {
      // 清除状态
      setUser(null);
      setToken(null);

      // 清除本地存储
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      // 已移除调试日志
    }
  };

  // 更新用户信息
  const updateUser = async (userData: Partial<User>) => {
    const updatedUser = { ...user, ...userData } as User;
    setUser(updatedUser);

    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      // 已移除调试日志
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;