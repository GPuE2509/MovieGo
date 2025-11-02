 import { View, Text, StyleSheet, ScrollView } from 'react-native';
 import { useQuery } from '@tanstack/react-query';
 import { getPromotionDetail } from '../services/HomeService';

 export default function PromotionDetailScreen({ route }) {
   const { id } = route.params ?? {};
   const { data, isLoading, error } = useQuery({
     queryKey: ['promotion-detail', id],
     queryFn: () => getPromotionDetail(id),
     enabled: !!id,
   });

   return (
     <ScrollView contentContainerStyle={styles.container}>
       <Text style={styles.title}>Chi tiết khuyến mãi</Text>
       {!id && <Text>Không có ID</Text>}
       {isLoading && <Text>Đang tải...</Text>}
       {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
       {!!data && (
         <View style={{ gap: 6 }}>
           <Text style={styles.header}>{data?.title || `Promotion #${id}`}</Text>
           {data?.description && <Text>{String(data.description)}</Text>}
           {data?.content && <Text>{String(data.content)}</Text>}
         </View>
       )}
     </ScrollView>
   );
 }

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  header: { fontSize: 18, fontWeight: '600' }
});
