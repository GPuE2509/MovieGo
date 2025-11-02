 import { View, Text, StyleSheet, Button } from 'react-native';
 import { useQuery } from '@tanstack/react-query';
 import { getMovieById } from '../services/MovieDetailService';

  export default function MovieDetailScreen({ route, navigation }) {
   const { id } = route.params ?? {};
   const { data, isLoading, error } = useQuery({
     queryKey: ['movie-detail', id],
     queryFn: () => getMovieById(id),
     enabled: !!id,
   });

   return (
     <View style={styles.container}>
       <Text style={styles.title}>Chi tiết phim</Text>
       {!id && <Text>Không có ID phim</Text>}
       {isLoading && <Text>Đang tải...</Text>}
       {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
       {!!data && (
         <View style={{ gap: 6 }}>
           <Text style={styles.name}>{data?.title || data?.name || `Movie #${id}`}</Text>
           {data?.description && <Text>Sơ lược: {String(data.description)}</Text>}
           {data?.duration && <Text>Thời lượng: {String(data.duration)} phút</Text>}
           {data?.genres && <Text>Thể loại: {Array.isArray(data.genres) ? data.genres.join(', ') : String(data.genres)}</Text>}
           <View style={{ height: 12 }} />
           <Button title="Chọn suất chiếu" onPress={() => navigation.navigate('Showtimes', { movieId: id })} />
         </View>
       )}
     </View>
   );
 }

 const styles = StyleSheet.create({
   container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
   title: { fontSize: 22, fontWeight: '700' },
   name: { fontSize: 18, fontWeight: '600' }
 });
