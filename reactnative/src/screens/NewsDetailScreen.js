 import { View, Text, StyleSheet, ScrollView } from 'react-native';
 import { useQuery } from '@tanstack/react-query';
 import { getPublicNewsById } from '../services/NewsService';

 export default function NewsDetailScreen({ route }) {
   const { id } = route.params ?? {};
   const { data, isLoading, error } = useQuery({
     queryKey: ['news-detail', id],
     queryFn: () => getPublicNewsById(id),
     enabled: !!id,
   });

   const detail = data?.data || data;

   return (
     <ScrollView contentContainerStyle={styles.container}>
       <Text style={styles.title}>Chi tiết tin tức</Text>
       {!id && <Text>Không có ID</Text>}
       {isLoading && <Text>Đang tải...</Text>}
       {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
       {!!detail && (
         <View style={{ gap: 6 }}>
           <Text style={styles.header}>{detail?.title || `News #${id}`}</Text>
           {detail?.description && <Text>{String(detail.description)}</Text>}
           {detail?.content && <Text>{String(detail.content)}</Text>}
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
