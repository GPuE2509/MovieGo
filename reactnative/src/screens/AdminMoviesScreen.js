import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMovies } from '../services/MovieService';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminMoviesScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => getMovies({}, token),
    enabled: !!token,
  });

  const list = Array.isArray(data) ? data : (data?.data || []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý phim</Text>
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo phim" onPress={() => nav.navigate('AdminMovieCreate')} />
      </View>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={list}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminMovieEdit', { id: item?.id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.title || item?.name || `Movie #${item?.id}`}</Text>
            {item?.status && <Text style={styles.itemSub}>{String(item.status)}</Text>}
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
