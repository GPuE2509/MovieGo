import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchSeatsByShowtime, createBooking } from '../services/SeatSelectionService';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function SeatSelectionScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { showtimeId } = route.params ?? {};
  const [selected, setSelected] = useState(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['seats', showtimeId],
    queryFn: () => fetchSeatsByShowtime(showtimeId, token),
    enabled: !!showtimeId && !!token,
  });

  const seats = useMemo(() => {
    if (!data) return [];
    const list = Array.isArray(data?.data) ? data.data : data;
    return Array.isArray(list) ? list : [];
  }, [data]);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const onBook = async () => {
    if (!selected.size) { Alert.alert('Thông báo', 'Chọn ít nhất 1 ghế'); return; }
    try {
      const bookingId = await createBooking(showtimeId, Array.from(selected), token);
      if (bookingId) {
        navigation.navigate('Payment', { bookingId });
      } else {
        Alert.alert('Lỗi', 'Không tạo được booking');
      }
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn ghế</Text>
      {!showtimeId && <Text>Thiếu showtimeId</Text>}
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={seats}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        numColumns={4}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.seat, selected.has(item.id) && styles.seatSelected]}
            onPress={() => toggle(item.id)}
          >
            <Text style={styles.seatText}>{String(item?.id)}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title={`Đặt ${selected.size} ghế`} onPress={onBook} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  seat: { width: 64, height: 48, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  seatSelected: { backgroundColor: '#e0f2ff', borderColor: '#38bdf8' },
  seatText: { fontWeight: '600' }
});
