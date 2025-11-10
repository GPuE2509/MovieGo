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
           <Text style={styles.name}>{data?.title}</Text>
           {data?.description && <Text>Sơ lược: {String(data.description)}</Text>}
           {data?.duration && <Text>Thời lượng: {String(data.duration)} phút</Text>}
           {data?.author && <Text>Tác giả: {String(data.author)}</Text>}
           {data?.actors && <Text>Diễn viên: {String(data.actors)}</Text>}
           {data?.type && <Text>Loại phim: {String(data.type)}</Text>}
           {data?.nations && <Text>Quốc gia: {String(data.nations)}</Text>}
           {data?.releaseDate && <Text>Ngày phát hành: {String(data.releaseDate)}</Text>}
           {data?.genres && <Text>Thể loại: {Array.isArray(data.genres) ? data.genres.join(', ') : String(data.genres)}</Text>}
           {data?.trailer && <Text>Trailer: {String(data.trailer)}</Text>}
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
