import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

const Login = ({ navigation }: any) => {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [showPassword, setShowPassword] = useState(false);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!form.username.trim()) {
      newErrors.username = '请输入用户名';
    }

    if (!form.password.trim()) {
      newErrors.password = '请输入密码';
    } else if (form.password.length < 6) {
      newErrors.password = '密码至少6位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 登录处理
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login(form.username, form.password);

      if (result.success) {
        Alert.alert('登录成功', '欢迎回来！', [
          { text: '确定', onPress: () => navigation.navigate('MainApp') }
        ]);
      } else {
        Alert.alert('登录失败', result.message || '登录失败，请重试');
      }
    } catch (error: any) {
      Alert.alert('登录失败', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到注册页面
  const goToRegister = () => {
    navigation.navigate('Register');
  };

  // 忘记密码
  const handleForgotPassword = () => {
    Alert.alert('忘记密码', '忘记密码功能开发中，请联系管理员重置密码');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* 标题 */}
          <Text style={styles.title}>欢迎登录</Text>
          <Text style={styles.subtitle}>请输入您的账号信息</Text>

          {/* 表单 */}
          <View style={styles.form}>
            {/* 用户名输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>用户名</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.username ? styles.inputError : null
                ]}
                placeholder="请输入用户名"
                value={form.username}
                onChangeText={(text) => {
                  setForm({ ...form, username: text });
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* 密码输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>密码</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password ? styles.inputError : null
                  ]}
                  placeholder="请输入密码"
                  value={form.password}
                  onChangeText={(text) => {
                    setForm({ ...form, password: text });
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* 忘记密码 */}
            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>忘记密码？</Text>
            </TouchableOpacity>

            {/* 登录按钮 */}
            <TouchableOpacity
              style={[styles.button, loading ? styles.buttonDisabled : null]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>登录</Text>
              )}
            </TouchableOpacity>

            {/* 注册链接 */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>还没有账号？</Text>
              <TouchableOpacity onPress={goToRegister}>
                <Text style={styles.registerLink}>立即注册</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 12,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default Login; 