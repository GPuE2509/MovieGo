 import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getPromotions } from '../services/HomeService';
import { useNavigation } from '@react-navigation/native';
import StatusView from '../components/StatusView';

export default function PromotionsScreen() {
  const nav = useNavigation();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({ queryKey: ['promotions-public'], queryFn: getPromotions });
  const list = Array.isArray(data) ? data : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khuyến mãi</Text>
      <StatusView loading={isLoading} error={error} isEmpty={!list || list.length === 0} emptyText="Chưa có khuyến mãi">
        <FlatList
          data={list}
          keyExtractor={(item, idx) => String(item?.id ?? idx)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => nav.navigate('PromotionDetail', { id: item?.id })}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item?.title || `Promotion #${item?.id}`}</Text>
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
