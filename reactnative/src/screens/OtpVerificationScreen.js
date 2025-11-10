import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Xác thực OTP</Text>
        <Text style={styles.subtitle}>
          Mã xác nhận đã được gửi đến
        </Text>
        <Text style={styles.emailText}>{email}</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
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
              selectionColor="#1a73e8"
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.resendButton, resendDisabled && styles.resendButtonDisabled]} 
          onPress={handleResendOtp}
          disabled={resendDisabled || loading}
        >
          {loading ? (
            <ActivityIndicator color="#1a73e8" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
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
    color: '#1a73e8',
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
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  otpInputFilled: {
    borderColor: '#1a73e8',
    backgroundColor: '#f0f7ff',
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  note: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default OtpVerificationScreen;
