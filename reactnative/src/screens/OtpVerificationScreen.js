import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Keyboard, 
  Alert, 
  ActivityIndicator, 
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const OtpVerificationScreen = ({ email, onVerifySuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const otpInputs = useRef([]);

  useEffect(() => {
    // Start countdown for resend OTP
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers and limit to 1 character
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto focus to next input
      if (value && index < 5) {
        otpInputs.current[index + 1].focus();
      }

      // If last character is entered, submit
      if (index === 5 && value) {
        Keyboard.dismiss();
        handleVerifyOtp(newOtp.join(''));
      }
    }
  };

  const handleKeyPress = (index, key) => {
    // Handle backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    if (otpCode.length < 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement OTP verification API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On successful verification
      onVerifySuccess();
    } catch (err) {
      setError('Mã OTP không hợp lệ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement resend OTP API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset OTP fields
      setOtp(['', '', '', '', '', '']);
      setResendDisabled(true);
      setCountdown(60);
      
      // Focus on first input
      otpInputs.current[0].focus();
      
      Alert.alert('Thành công', 'Đã gửi lại mã OTP mới đến email của bạn');
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#b91c1c', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác thực OTP</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Mã xác nhận đã được gửi đến
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>❌ {error}</Text>
            </View>
          ) : null}
          
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => (otpInputs.current[index] = ref)}
                style={[styles.otpInput, otp[index] ? styles.otpInputFilled : null]}
                value={otp[index]}
                onChangeText={(text) => handleOtpChange(index, text)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
                selectionColor="#b91c1c"
                placeholder="•"
                placeholderTextColor="#999"
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.resendButton, resendDisabled && styles.resendButtonDisabled]} 
            onPress={handleResendOtp}
            disabled={resendDisabled || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#b91c1c" />
            ) : (
              <Text style={styles.resendButtonText}>
                {resendDisabled ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã OTP'}
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.note}>
            Nếu không nhận được mã, vui lòng kiểm tra thư mục thư rác hoặc nhấn "Gửi lại mã OTP"
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f5f5f5',
  },
  otpInputFilled: {
    borderColor: '#b91c1c',
    backgroundColor: '#fee2e2',
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#b91c1c',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  resendButtonDisabled: {
    borderColor: '#d1d5db',
  },
  resendButtonText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OtpVerificationScreen;
