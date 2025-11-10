import { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { register } from '../services/AuthService';

export default function RegisterScreen({ navigation }) {
  const { setToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const onSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Basic validation
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }
      
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Email không đúng định dạng');
      }

      // Password validation
      if (formData.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // Map form data to API format
      const apiData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      };

      console.log('Sending registration data:', apiData);
      
      const data = await register(apiData);
      console.log('Registration response:', data);
      
      if (data?.token) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng...');
        await setToken(data.token);
        // Add a small delay to show success message
        setTimeout(() => {
          navigation.navigate('MainTabs');
        }, 1500);
      } else {
        setError('Đăng ký thất bại: Không nhận được token');
      }
    } catch (e) {
      console.error('Registration error:', e);
      setError(e?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>
        
        {!!error && (
          <View style={[styles.messageContainer, styles.errorContainer]}>
            <Text style={styles.error}>❌ {error}</Text>
          </View>
        )}
        
        {!!success && (
          <View style={[styles.messageContainer, styles.successContainer]}>
            <Text style={styles.success}>✅ {success}</Text>
          </View>
        )}
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Họ *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập họ" 
              value={formData.last_name}
              onChangeText={(text) => handleInputChange('last_name', text)}
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Tên *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập tên" 
              value={formData.first_name}
              onChangeText={(text) => handleInputChange('first_name', text)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập email" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập số điện thoại" 
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Nhập địa chỉ" 
            multiline
            numberOfLines={3}
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={[styles.input, styles.passwordInput]} 
              placeholder="Nhập mật khẩu" 
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Xác nhận mật khẩu *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={[styles.input, styles.passwordInput]} 
              placeholder="Nhập lại mật khẩu" 
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <Text style={styles.errorText}>Mật khẩu không khớp</Text>
          )}
        </View>
        
        <Button 
          title={loading ? 'Đang xử lý...' : 'Đăng ký'} 
          onPress={onSubmit} 
          disabled={loading} 
        />

        <View style={styles.loginContainer}>
          <Text>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  error: { 
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500'
  },
  success: {
    color: '#059669',
    textAlign: 'center',
    fontWeight: '500'
  },
  successContainer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    padding: 12,
    fontSize: 16,
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingRight: 10,
  },
  passwordInput: {
    borderWidth: 0,
    paddingRight: 30,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#1a73e8',
    fontWeight: '500',
  }
});
