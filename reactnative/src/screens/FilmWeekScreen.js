import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getNowShowingMovies, getComingSoonMovies } from '../services/HomeService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function FilmWeekScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('now-showing');
  
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

  const activeQuery = activeTab === 'now-showing' ? nowShowing : comingSoon;
  const movies = activeQuery.data || [];

  const renderMovieCard = (movie) => (
    <TouchableOpacity 
      key={movie?._id || movie?.id} 
      style={styles.movieCard}
      onPress={() => navigation?.navigate('MovieDetail', { id: movie?._id || movie?.id })}
      activeOpacity={0.7}
    >
      <View style={styles.posterContainer}>
        {movie?.posterUrl ? (
          <Image 
            source={{ uri: movie.posterUrl }} 
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderPoster}>
            <Ionicons name="film-outline" size={40} color="#ccc" />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.posterGradient}
        />
      </View>
      
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {movie?.title || 'Untitled'}
        </Text>
        
        <View style={styles.genreContainer}>
          <Ionicons name="pricetag" size={12} color="#ff6b6b" />
          <Text style={styles.genreText} numberOfLines={1}>
            {Array.isArray(movie?.genreNames) 
              ? movie.genreNames.join(', ') 
              : movie?.genreNames || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={12} color="#666" />
          <Text style={styles.infoText}>
            {movie?.releaseDate || 'TBA'}
          </Text>
        </View>
        
        {movie?.duration && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.infoText}>{movie.duration} phút</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#ff6b6b', '#ee5a6f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🎬 Tuần Phim</Text>
        <Text style={styles.headerSubtitle}>Khám phá những bộ phim hot nhất</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'now-showing' && styles.activeTab]}
          onPress={() => setActiveTab('now-showing')}
        >
          <Ionicons 
            name="play-circle" 
            size={20} 
            color={activeTab === 'now-showing' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'now-showing' && styles.activeTabText]}>
            Đang Chiếu
          </Text>
          {nowShowing.data?.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{nowShowing.data.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'coming-soon' && styles.activeTab]}
          onPress={() => setActiveTab('coming-soon')}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={activeTab === 'coming-soon' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'coming-soon' && styles.activeTabText]}>
            Sắp Chiếu
          </Text>
          {comingSoon.data?.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{comingSoon.data.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={activeQuery.isRefetching}
            onRefresh={activeQuery.refetch}
            colors={['#ff6b6b']}
          />
        }
      >
        {activeQuery.isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#ff6b6b" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : activeQuery.error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={60} color="#ff6b6b" />
            <Text style={styles.errorText}>
              {activeQuery.error?.message || 'Đã có lỗi xảy ra'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => activeQuery.refetch()}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : movies.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="film-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>
              {activeTab === 'now-showing' 
                ? 'Chưa có phim đang chiếu' 
                : 'Chưa có phim sắp chiếu'}
            </Text>
            <Text style={styles.emptySubtext}>
              Vui lòng quay lại sau
            </Text>
          </View>
        ) : (
          <View style={styles.moviesGrid}>
            {movies.map(renderMovieCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: '#ff6b6b',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff6b6b',
  },
  content: {
    flex: 1,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 16,
  },
  movieCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    height: 80,
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    lineHeight: 22,
  },
  genreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  genreText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#ff6b6b',
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
});
