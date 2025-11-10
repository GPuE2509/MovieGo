 import { useQuery } from '@tanstack/react-query';
 import { 
   View, 
   Text, 
   StyleSheet, 
   FlatList, 
   TouchableOpacity, 
   ScrollView,
   Image,
   ActivityIndicator,
   Dimensions
 } from 'react-native';
 import { LinearGradient } from 'expo-linear-gradient';
 import { Ionicons } from '@expo/vector-icons';
 import { getNowShowingMovies, getComingSoonMovies } from '../services/HomeService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

 export default function HomeScreen({ navigation }) {
   const nowShowing = useQuery({ 
     queryKey: ['now-showing'], 
     queryFn: async () => {
       const data = await getNowShowingMovies();
       return Array.isArray(data) ? data : (data?.data ? data.data : []);
     }
   });
   
   const comingSoon = useQuery({ 
     queryKey: ['coming-soon'], 
     queryFn: async () => {
       const data = await getComingSoonMovies();
       return Array.isArray(data) ? data : (data?.data ? data.data : []);
     }
   });

   const renderMovie = ({ item }) => (
     <TouchableOpacity 
       style={styles.card} 
       onPress={() => navigation.navigate('MovieDetail', { id: item?._id || item?.id })}
       activeOpacity={0.8}
     >
       <View style={styles.posterContainer}>
         {item?.posterUrl ? (
           <Image 
             source={{ uri: item.posterUrl }} 
             style={styles.poster}
             resizeMode="cover"
           />
         ) : (
           <View style={styles.placeholderPoster}>
             <Ionicons name="film-outline" size={50} color="#ccc" />
           </View>
         )}
         <LinearGradient
           colors={['transparent', 'rgba(0,0,0,0.9)']}
           style={styles.posterGradient}
         >
           <View style={styles.cardInfo}>
             <Text numberOfLines={2} style={styles.cardTitle}>
               {item?.title || 'Untitled'}
             </Text>
             <View style={styles.genreRow}>
               <Ionicons name="pricetag" size={12} color="#ff6b6b" />
               <Text numberOfLines={1} style={styles.genreText}>
                 {Array.isArray(item?.genreNames) 
                   ? item.genreNames.join(', ') 
                   : item?.genreNames || 'N/A'}
               </Text>
             </View>
           </View>
         </LinearGradient>
       </View>
     </TouchableOpacity>
   );

   const renderSection = (title, query, icon) => (
     <View style={styles.section}>
       <View style={styles.sectionHeader}>
         <View style={styles.sectionTitleRow}>
           <Ionicons name={icon} size={24} color="#ff6b6b" />
           <Text style={styles.sectionTitle}>{title}</Text>
         </View>
         {query.data?.length > 0 && (
           <TouchableOpacity onPress={() => navigation.navigate('Movies')}>
             <Text style={styles.viewAll}>Xem tất cả →</Text>
           </TouchableOpacity>
         )}
       </View>

       {query.isLoading ? (
         <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color="#ff6b6b" />
           <Text style={styles.loadingText}>Đang tải...</Text>
         </View>
       ) : query.error ? (
         <View style={styles.errorContainer}>
           <Ionicons name="alert-circle-outline" size={40} color="#ff6b6b" />
           <Text style={styles.errorText}>
             {String(query.error?.message || query.error)}
           </Text>
         </View>
       ) : !query.data || query.data.length === 0 ? (
         <View style={styles.emptyContainer}>
           <Ionicons name="film-outline" size={50} color="#ddd" />
           <Text style={styles.emptyText}>Chưa có phim nào</Text>
         </View>
       ) : (
         <FlatList
           data={query.data}
           horizontal
           keyExtractor={(item, idx) => String(item?._id || item?.id || idx)}
           renderItem={renderMovie}
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={styles.listContent}
         />
       )}
     </View>
   );

   return (
     <View style={styles.container}>
       <LinearGradient
         colors={['#b91c1c', '#991b1b']}
         start={{ x: 0, y: 0 }}
         end={{ x: 1, y: 1 }}
         style={styles.header}
       >
         <Text style={styles.headerTitle}>🎬 MovieGo</Text>
         <Text style={styles.headerSubtitle}>Khám phá thế giới điện ảnh</Text>
       </LinearGradient>

       <ScrollView 
         style={styles.content}
         showsVerticalScrollIndicator={false}
       >
         {renderSection('Đang Chiếu', nowShowing, 'play-circle')}
         {renderSection('Sắp Chiếu', comingSoon, 'calendar')}
         
         <View style={styles.footer}>
           <TouchableOpacity 
             style={styles.exploreButton}
             onPress={() => navigation.navigate('Movies')}
           >
             <Ionicons name="film" size={20} color="#fff" />
             <Text style={styles.exploreButtonText}>Khám phá tất cả phim</Text>
           </TouchableOpacity>
         </View>
       </ScrollView>
     </View>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  viewAll: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  posterContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholderPoster: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardInfo: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  genreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b91c1c',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#b91c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
