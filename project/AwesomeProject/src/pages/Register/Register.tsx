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
import request from '../../../api/request';

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  phone?: string;
}

const Register = ({ navigation }: any) => {
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};

    // 用户名验证
    if (!form.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (form.username.length < 3) {
      newErrors.username = '用户名至少3位';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线';
    }

    // 密码验证
    if (!form.password.trim()) {
      newErrors.password = '请输入密码';
    } else if (form.password.length < 6) {
      newErrors.password = '密码至少6位';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = '密码至少包含一个字母和一个数字';
    }

    // 确认密码验证
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = '请确认密码';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    // 邮箱验证（可选）
    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = '请输入正确的邮箱格式';
      }
    }

    // 手机号验证（可选）
    if (form.phone && form.phone.trim()) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(form.phone)) {
        newErrors.phone = '请输入正确的手机号格式';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 注册处理
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await request({
        method: 'POST',
        url: '/users/register',
        data: {
          username: form.username,
          password: form.password,
          email: form.email || undefined,
          phone: form.phone || undefined
        }
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('注册成功', '请返回登录页面进行登录', [
          { text: '确定', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error: any) {
      Alert.alert('注册失败', error.response?.data?.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到登录页面
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  // 更新表单字段
  const updateField = (field: keyof RegisterForm, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* 标题 */}
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>请填写以下信息完成注册</Text>

          {/* 表单 */}
          <View style={styles.form}>
            {/* 用户名输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>用户名 *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.username ? styles.inputError : null
                ]}
                placeholder="请输入用户名"
                value={form.username}
                onChangeText={(text) => updateField('username', text)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* 密码输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>密码 *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password ? styles.inputError : null
                  ]}
                  placeholder="请输入密码"
                  value={form.password}
                  onChangeText={(text) => updateField('password', text)}
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

            {/* 确认密码输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>确认密码 *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.confirmPassword ? styles.inputError : null
                  ]}
                  placeholder="请再次输入密码"
                  value={form.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* 邮箱输入框（可选）*/}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>邮箱（可选）</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email ? styles.inputError : null
                ]}
                placeholder="请输入邮箱"
                value={form.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* 手机号输入框（可选）*/}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>手机号（可选）</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.phone ? styles.inputError : null
                ]}
                placeholder="请输入手机号"
                value={form.phone}
                onChangeText={(text) => updateField('phone', text)}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* 注册按钮 */}
            <TouchableOpacity
              style={[styles.button, loading ? styles.buttonDisabled : null]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>注册</Text>
              )}
            </TouchableOpacity>

            {/* 登录链接 */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>已有账号？</Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.loginLink}>立即登录</Text>
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
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default Register;