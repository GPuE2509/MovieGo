import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/AdminUserService';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminUsersScreen() {
  const { token } = useContext(AuthContext);
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-users'], queryFn: () => getUsers(token), enabled: !!token });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý người dùng</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={data?.data || []}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item?.email || `User #${item?.id}`}</Text>
            {item?.status && <Text style={styles.itemSub}>{String(item.status)}</Text>}
          </View>
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
  itemSub: { color: '#666', marginTop: 4 }
});
