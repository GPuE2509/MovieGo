import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Image, 
  ScrollView 
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchPaymentMethods, processPayment } from '../services/PaymentService';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

export default function PaymentScreen({ route }) {
  const bookingId = route?.params?.bookingId;
  const [resultMsg, setResultMsg] = useState('');
  const { data, isLoading, error } = useQuery({ queryKey: ['payment-methods'], queryFn: fetchPaymentMethods });

  const onSelectMethod = async (method) => {
    if (!bookingId) { Alert.alert('Thiếu booking', 'Vui lòng tạo booking trước.'); return; }
    try {
      const url = await processPayment(bookingId, method?.id);
      if (url) {
        Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không nhận được URL thanh toán');
      }
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || e));
    }
  };

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      try {
        const parsed = Linking.parse(url);
        const qs = parsed?.queryParams || {};
        if (qs.status) {
          setResultMsg(`Kết quả thanh toán: ${String(qs.status)}`);
          if (String(qs.status).toLowerCase() === 'success') {
            Alert.alert('Thanh toán', 'Thanh toán thành công');
          } else {
            Alert.alert('Thanh toán', 'Thanh toán thất bại hoặc bị hủy');
          }
        }
      } catch {}
    });
    return () => { try { sub?.remove?.(); } catch {} };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b91c1c" />
        <Text style={styles.loadingText}>Đang tải phương thức thanh toán...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#b91c1c" />
        <Text style={styles.errorText}>
          Có lỗi xảy ra: {String(error?.message || error)}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {!!resultMsg && (
          <View style={[
            styles.resultContainer,
            resultMsg.includes('thành công') ? styles.successContainer : styles.errorContainer
          ]}>
            <Ionicons 
              name={resultMsg.includes('thành công') ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={resultMsg.includes('thành công') ? '#10b981' : '#ef4444'} 
            />
            <Text style={styles.resultText}>{resultMsg}</Text>
          </View>
        )}

        <View style={styles.bookingInfo}>
          <Text style={styles.sectionTitle}>Thông tin đặt vé</Text>
          <View style={styles.infoRow}>
            <Ionicons name="ticket-outline" size={20} color="#4b5563" />
            <Text style={styles.infoText}>Mã đặt vé: <Text style={styles.highlight}>#{bookingId || 'N/A'}</Text></Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
        </View>

        <FlatList
          data={Array.isArray(data) ? data : []}
          keyExtractor={(item, idx) => String(item?.id ?? idx)}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.pmItem} 
              onPress={() => onSelectMethod(item)}
              activeOpacity={0.8}
            >
              <View style={styles.pmIconContainer}>
                <Ionicons 
                  name={getPaymentMethodIcon(item?.name)} 
                  size={24} 
                  color="#b91c1c" 
                />
              </View>
              <View style={styles.pmInfo}>
                <Text style={styles.pmTitle}>{item?.name || `Phương thức #${item?.id}`}</Text>
                {item?.description && (
                  <Text style={styles.pmDesc} numberOfLines={2}>
                    {String(item.description)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Không có phương thức thanh toán nào</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const getPaymentMethodIcon = (methodName = '') => {
  const name = methodName.toLowerCase();
  if (name.includes('momo')) return 'phone-portrait';
  if (name.includes('zalo') || name.includes('pay')) return 'wallet';
  if (name.includes('bank') || name.includes('ngân hàng')) return 'card';
  if (name.includes('visa') || name.includes('mastercard')) return 'card';
  return 'card-outline';
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
  content: {
    flex: 1,
    padding: 16,
  },
  bookingInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  highlight: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  pmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pmIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pmInfo: {
    flex: 1,
    marginRight: 12,
  },
  pmTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  pmDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#10b981',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  resultText: {
    marginLeft: 8,
    color: '#065f46',
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
});
