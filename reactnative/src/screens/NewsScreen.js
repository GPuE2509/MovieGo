 import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getPublicNews } from '../services/NewsService';
import { useNavigation } from '@react-navigation/native';
import StatusView from '../components/StatusView';

export default function NewsScreen() {
  const nav = useNavigation();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({ queryKey: ['news-public'], queryFn: () => getPublicNews({ page: 0, pageSize: 20 }) });

  const list = data?.data?.data || data?.data || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tin tức</Text>
      <StatusView loading={isLoading} error={error} isEmpty={!list || list.length === 0} emptyText="Chưa có tin tức">
        <FlatList
          data={Array.isArray(list) ? list : []}
          keyExtractor={(item, idx) => String(item?.id ?? idx)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => nav.navigate('NewsDetail', { id: item?.id })}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item?.title || `News #${item?.id}`}</Text>
              {item?.description && <Text style={styles.itemDesc} numberOfLines={2}>{String(item.description)}</Text>}
            </TouchableOpacity>
          )}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        />
      </StatusView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  item: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  itemTitle: { fontWeight: '600' },
  itemDesc: { color: '#666', marginTop: 4 }
});
