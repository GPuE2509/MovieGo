 import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchPaymentMethods } from '../services/PaymentService';
import { processPayment } from '../services/PaymentService';
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phương thức thanh toán</Text>
      {!!resultMsg && <Text style={styles.result}>{resultMsg}</Text>}
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={Array.isArray(data) ? data : []}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.pmItem} onPress={() => onSelectMethod(item)}>
            <Text style={styles.pmTitle}>{item?.name || `Method #${item?.id}`}</Text>
            {item?.description && <Text style={styles.pmDesc}>{String(item.description)}</Text>}
            {bookingId && <Text style={styles.pmHint}>Chạm để thanh toán booking #{bookingId}</Text>}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  pmItem: { padding: 12, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8 },
  pmTitle: { fontWeight: '600' },
  pmDesc: { color: '#666', marginTop: 4 },
  pmHint: { marginTop: 6, color: '#0ea5e9' }
});
