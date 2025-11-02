import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getPromotions } from '../services/AdminPromotionService';
import { useNavigation } from '@react-navigation/native';

export default function AdminPromotionsScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => getPromotions({ page: 0, pageSize: 50 }, token),
    enabled: !!token,
  });

  const list = data?.data || data || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý khuyến mãi</Text>
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo khuyến mãi" onPress={() => nav.navigate('AdminPromotionCreate')} />
      </View>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={Array.isArray(list) ? list : []}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminPromotionEdit', { id: item?.id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.title || `Promotion #${item?.id}`}</Text>
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
