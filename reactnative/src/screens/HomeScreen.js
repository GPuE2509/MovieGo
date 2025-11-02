 import { useQuery } from '@tanstack/react-query';
 import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
 import { getNowShowingMovies, getComingSoonMovies } from '../services/HomeService';

 export default function HomeScreen({ navigation }) {
   const nowShowing = useQuery({ queryKey: ['now-showing'], queryFn: getNowShowingMovies });
   const comingSoon = useQuery({ queryKey: ['coming-soon'], queryFn: getComingSoonMovies });

   const renderMovie = ({ item }) => (
     <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MovieDetail', { id: item?.id })}>
       <Text numberOfLines={1} style={styles.cardTitle}>{item?.title || item?.name || `Movie #${item?.id}`}</Text>
     </TouchableOpacity>
   );

   return (
     <View style={styles.container}>
       <Text style={styles.title}>Trang chủ</Text>
       <Button title="Tới danh sách phim" onPress={() => navigation.navigate('Movies')} />

       <Text style={styles.section}>Đang chiếu</Text>
       {nowShowing.isLoading ? (
         <Text>Đang tải...</Text>
       ) : nowShowing.error ? (
         <Text style={styles.error}>Lỗi: {String(nowShowing.error?.message || nowShowing.error)}</Text>
       ) : (
         <FlatList
           data={Array.isArray(nowShowing.data) ? nowShowing.data : []}
           horizontal
           keyExtractor={(item, idx) => String(item?.id ?? idx)}
           renderItem={renderMovie}
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={{ gap: 8 }}
         />
       )}

       <Text style={styles.section}>Sắp chiếu</Text>
       {comingSoon.isLoading ? (
         <Text>Đang tải...</Text>
       ) : comingSoon.error ? (
         <Text style={styles.error}>Lỗi: {String(comingSoon.error?.message || comingSoon.error)}</Text>
       ) : (
         <FlatList
           data={Array.isArray(comingSoon.data) ? comingSoon.data : []}
           horizontal
           keyExtractor={(item, idx) => String(item?.id ?? idx)}
           renderItem={renderMovie}
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={{ gap: 8 }}
         />
       )}
     </View>
   );
 }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  section: { marginTop: 8, fontSize: 18, fontWeight: '600' },
  error: { color: 'red' },
  card: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, minWidth: 160 },
  cardTitle: { fontWeight: '600' }
});
