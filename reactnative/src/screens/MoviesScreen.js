 import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNowShowingMovies } from '../services/MovieService';
import StatusView from '../components/StatusView';

export default function MoviesScreen({ navigation }) {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({ queryKey: ['movies-now'], queryFn: getNowShowingMovies });

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('MovieDetail', { id: item?.id })}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item?.title || item?.name || `Movie #${item?.id}`}</Text>
      {item?.genreNames && <Text style={styles.itemSub} numberOfLines={1}>{String(item.genreNames)}</Text>}
       <Text numberOfLines={1} style={styles.itemSub}>{item?.releaseDate}</Text>
      
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách phim</Text>
      <StatusView loading={isLoading} error={error} isEmpty={!data || (Array.isArray(data) && data.length === 0)} emptyText="Chưa có phim">
        <FlatList
          data={Array.isArray(data) ? data : []}
          keyExtractor={(item, idx) => String(item?.id ?? idx)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        />
      </StatusView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  item: { padding: 12, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8 },
  itemTitle: { fontWeight: '600' },
  itemSub: { color: '#555', marginTop: 2 },
  error: { color: 'red' }
});
