import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAllTheaters } from '../services/TheaterService';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminTheatersScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-theaters', currentPage, pageSize],
    queryFn: () => getAllTheaters({ page: currentPage, size: pageSize }, token),
    enabled: !!token,
  });

  const list = Array.isArray(data) ? data : (data?.data?.data?.data || []);
  const pagination = data?.data?.data || {};

  // Debug log để kiểm tra dữ liệu
  console.log('API Response:', data);
  console.log('Theaters list:', list);
  console.log('Pagination:', pagination);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý rạp</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo rạp" onPress={() => nav.navigate('AdminTheaterCreate')} />
      </View>
      <FlatList
        data={Array.isArray(list) ? list : []}
        keyExtractor={(item, idx) => String(item?._id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminTheaterEdit', { id: item?._id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.name || `Theater #${item?._id}`}</Text>
            
            {item?.address && (
              <Text style={styles.itemAddress} numberOfLines={2}>
                📍 {item.address}
              </Text>
            )}
            
            {item?.city && (
              <Text style={styles.itemInfo}>
                🏙️ Thành phố: {item.city}
              </Text>
            )}
            
            <View style={styles.contactInfo}>
              {item?.phone && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  <Text style={styles.contactText}>📞 {item.phone}</Text>
                </TouchableOpacity>
              )}
              
              {item?.email && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`mailto:${item.email}`)}
                >
                  <Text style={styles.contactText}>✉️ {item.email}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.statusContainer}>
              <Text style={[styles.statusTag, item?.is_active ? styles.activeStatus : styles.inactiveStatus]}>
                {item?.is_active ? '🟢 Hoạt động' : '🔴 Ngưng hoạt động'}
              </Text>
              
              {item?.created_at && (
                <Text style={styles.dateInfo}>
                  Tạo: {new Date(item.created_at).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
      />
      
      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationInfo}>
            Trang {(pagination.page || currentPage) + 1} / {pagination.totalPages || 1} 
            ({pagination.total || 0} rạp)
          </Text>
          <View style={styles.paginationButtons}>
            <TouchableOpacity 
              style={[styles.paginationButton, (!pagination.hasPrevious || currentPage === 0) && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevious || currentPage === 0 || isLoading}
            >
              <Text style={[styles.paginationButtonText, (!pagination.hasPrevious || currentPage === 0) && styles.paginationButtonTextDisabled]}>
                Trước
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paginationButton, !pagination.hasNext && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext || isLoading}
            >
              <Text style={[styles.paginationButtonText, !pagination.hasNext && styles.paginationButtonTextDisabled]}>
                Sau
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Thêm thông tin debug khi cần */}
          {__DEV__ && (
            <Text style={styles.debugInfo}>
              Debug: API page={pagination.page}, Local page={currentPage}, 
              HasNext={String(pagination.hasNext)}, HasPrevious={String(pagination.hasPrevious)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  item: { 
    padding: 16, 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderRadius: 12,
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  itemTitle: { 
    fontWeight: '700', 
    fontSize: 18, 
    color: '#333',
    marginBottom: 8
  },
  itemAddress: { 
    color: '#555', 
    fontSize: 14, 
    marginBottom: 6,
    lineHeight: 20
  },
  itemInfo: { 
    color: '#666', 
    fontSize: 13, 
    marginBottom: 8
  },
  contactInfo: { 
    marginBottom: 12
  },
  contactItem: { 
    marginBottom: 4
  },
  contactText: { 
    color: '#007AFF', 
    fontSize: 13,
    textDecorationLine: 'underline'
  },
  statusContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  statusTag: { 
    fontSize: 12, 
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  activeStatus: { 
    backgroundColor: '#E8F5E8', 
    color: '#2D5A2D'
  },
  inactiveStatus: { 
    backgroundColor: '#FDE8E8', 
    color: '#8B2635'
  },
  dateInfo: { 
    color: '#999', 
    fontSize: 11,
    fontStyle: 'italic'
  },
  paginationContainer: { 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    marginTop: 8 
  },
  paginationInfo: { 
    textAlign: 'center', 
    color: '#666', 
    fontSize: 14, 
    marginBottom: 12 
  },
  paginationButtons: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 16 
  },
  paginationButton: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 6 
  },
  paginationButtonDisabled: { 
    backgroundColor: '#ccc' 
  },
  paginationButtonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  paginationButtonTextDisabled: { 
    color: '#999' 
  },
  debugInfo: { 
    fontSize: 10, 
    color: '#999', 
    textAlign: 'center', 
    marginTop: 8 
  }
});
