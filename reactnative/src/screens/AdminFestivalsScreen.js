import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getFestivals as getAdminFestivals } from '../services/FestivalService';

export default function AdminFestivalsScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-festivals'],
    queryFn: () => getAdminFestivals({ page: 0, pageSize: 50 }, token),
    enabled: !!token,
  });

  const list = data?.data || data || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý liên hoan phim</Text>
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo liên hoan phim" onPress={() => nav.navigate('AdminFestivalCreate')} />
      </View>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={Array.isArray(list) ? list : []}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminFestivalEdit', { id: item?.id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.title || item?.name || `Festival #${item?.id}`}</Text>
            {item?.description && <Text style={styles.itemSub} numberOfLines={2}>{String(item.description)}</Text>}
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
