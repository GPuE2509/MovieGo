import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMovies } from '../services/MovieService';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminMoviesScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-movies', currentPage, pageSize],
    queryFn: () => getMovies({ page: currentPage, size: pageSize }, token),
    enabled: !!token,
  });

  const list = Array.isArray(data) ? data : (data?.content || []);
  const pagination = data || {};

  // Debug log để kiểm tra dữ liệu
  console.log('API Response:', data);
  console.log('Movies list:', list);
  console.log('Pagination:', pagination);
  console.log('Total Pages:', pagination.totalPages);
  console.log('Current Page:', currentPage);
  console.log('Page Number from API:', pagination.number);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý phim</Text>
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo phim" onPress={() => nav.navigate('AdminMovieCreate')} />
      </View>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={list}
        keyExtractor={(item, idx) => String(item?._id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminMovieEdit', { id: item?._id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.title || item?.name || `Movie #${item?._id}`}</Text>
            {item?.description && <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>}
            
            <View style={styles.itemDetails}>
              {item?.duration && <Text style={styles.itemSub}>Thời lượng: {item.duration} phút</Text>}
              {item?.type && <Text style={styles.itemSub}>Loại: {item.type}</Text>}
              {item?.nation && <Text style={styles.itemSub}>Quốc gia: {item.nation}</Text>}
            </View>

            {item?.release_date && (
              <Text style={styles.itemInfo}>
                Ngày phát hành: {new Date(item.release_date).toLocaleDateString('vi-VN')}
              </Text>
            )}
            
            {item?.actors && (
              <Text style={styles.itemInfo} numberOfLines={2}>
                Diễn viên: {item.actors}
              </Text>
            )}
            
            {item?.genres && item.genres.length > 0 && (
              <View style={styles.genresContainer}>
                <Text style={styles.genresLabel}>Thể loại: </Text>
                {item.genres.map((genre, index) => (
                  <Text key={index} style={styles.genreTag}>
                    {genre.name || genre}
                  </Text>
                ))}
              </View>
            )}
            
            {item?.trailer && (
              <TouchableOpacity 
                style={styles.trailerButton}
                onPress={() => Linking.openURL(item.trailer)}
              >
                <Text style={styles.trailerText}>Xem trailer</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      />
      
      {/* Pagination Controls */}
      {pagination.totalElements > 0 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationInfo}>
            Trang {(pagination.number || currentPage) + 1} / {pagination.totalPages || 1} 
            ({pagination.totalElements || 0} phim)
          </Text>
          <View style={styles.paginationButtons}>
            <TouchableOpacity 
              style={[styles.paginationButton, (pagination.first || currentPage === 0) && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={pagination.first || currentPage === 0 || isLoading}
            >
              <Text style={[styles.paginationButtonText, (pagination.first || currentPage === 0) && styles.paginationButtonTextDisabled]}>
                Trước
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paginationButton, pagination.last && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={pagination.last || isLoading}
            >
              <Text style={[styles.paginationButtonText, pagination.last && styles.paginationButtonTextDisabled]}>
                Sau
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  item: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  itemTitle: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  itemDescription: { color: '#666', fontSize: 14, marginBottom: 8 },
  itemDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  itemSub: { color: '#666', fontSize: 12, backgroundColor: '#f5f5f5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  itemInfo: { color: '#555', fontSize: 13, marginBottom: 4 },
  genresContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 },
  genresLabel: { color: '#555', fontSize: 13, marginRight: 4 },
  genreTag: { color: '#007AFF', fontSize: 12, backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 2 },
  trailerButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  trailerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  paginationContainer: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#eee', marginTop: 8 },
  paginationInfo: { textAlign: 'center', color: '#666', fontSize: 14, marginBottom: 12 },
  paginationButtons: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  paginationButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  paginationButtonDisabled: { backgroundColor: '#ccc' },
  paginationButtonText: { color: '#fff', fontWeight: '600' },
  paginationButtonTextDisabled: { color: '#999' },
  debugInfo: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 8 }
});
