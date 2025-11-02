import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAllTheaters } from '../services/TheaterService';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminTheatersScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-theaters'],
    queryFn: () => getAllTheaters({ page: 0, size: 50 }, token),
    enabled: !!token,
  });

  const list = data?.data?.data || data?.data || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý rạp</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo rạp" onPress={() => nav.navigate('AdminTheaterCreate')} />
      </View>
      <FlatList
        data={Array.isArray(list) ? list : []}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminTheaterEdit', { id: item?.id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.name || `Theater #${item?.id}`}</Text>
            {item?.address && <Text style={styles.itemSub}>{String(item.address)}</Text>}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  item: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  itemTitle: { fontWeight: '600' },
  itemSub: { color: '#666', marginTop: 2 }
});
