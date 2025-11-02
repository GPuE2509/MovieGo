import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAllAdminScreens } from '../services/Screens';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminScreensScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-screens'],
    queryFn: () => getAllAdminScreens(token),
    enabled: !!token,
  });

  const list = Array.isArray(data?.list) ? data.list : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý phòng chiếu</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo phòng chiếu" onPress={() => nav.navigate('AdminScreenCreate')} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminScreenEdit', { id: item?.id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.name || `Screen #${item?.id}`}</Text>
            {item?.theaterName && <Text style={styles.itemSub}>{String(item.theaterName)}</Text>}
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
