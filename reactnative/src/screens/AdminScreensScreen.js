import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAllAdminScreens } from '../services/Screens';
import { getAllTheaters } from '../services/TheaterService';
import { useContext, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminScreensScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-screens', currentPage, pageSize],
    queryFn: () => getAllAdminScreens({ page: currentPage, size: pageSize }, token),
    enabled: !!token,
  });

  // Query để lấy danh sách theaters
  const { data: theatersData, isLoading: theatersLoading } = useQuery({
    queryKey: ['admin-theaters-all'],
    queryFn: () => getAllTheaters({ page: 0, size: 1000 }, token), // Lấy nhiều để có tất cả theaters
    enabled: !!token,
  });

  const list = Array.isArray(data) ? data : (data?.data?.content || []);
  const pagination = data?.data || {};

  // Tạo mapping từ theaterId đến theater info (name + address)
  const theaterMap = useMemo(() => {
    const theaters = theatersData?.data?.data?.data || [];
    console.log('Theaters data:', theaters);
    
    const map = {};
    theaters.forEach(theater => {
      if (theater._id) {
        map[theater._id] = {
          name: theater.name || 'Không có tên',
          address: theater.address || 'Không có địa chỉ',
          city: theater.city || ''
        };
      }
    });
    console.log('Theater map:', map);
    return map;
  }, [theatersData]);

  // Debug log để kiểm tra dữ liệu
  console.log('API Response:', data);
  console.log('Screens list:', list);
  console.log('Pagination:', pagination);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý phòng chiếu</Text>
      {(isLoading || theatersLoading) && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo phòng chiếu" onPress={() => nav.navigate('AdminScreenCreate')} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminScreenEdit', { id: item?.id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.name || `Screen #${item?.id}`}</Text>
            
            <View style={styles.itemDetails}>
              {item?.seatCapacity && (
                <Text style={styles.itemInfo}>
                  🪑 Sức chứa: {item.seatCapacity} ghế
                </Text>
              )}
              
              {(item?.maxRows && item?.maxColumns) && (
                <Text style={styles.itemInfo}>
                  📐 Kích thước: {item.maxRows} hàng × {item.maxColumns} cột
                </Text>
              )}
              
              {item?.theaterId && (
                <View style={styles.theaterInfo}>
                  {theaterMap[item.theaterId] ? (
                    <>
                      <Text style={styles.theaterName}>
                        🏢 {theaterMap[item.theaterId].name}
                      </Text>
                      <Text style={styles.theaterAddress}>
                        📍 {theaterMap[item.theaterId].address}
                        {theaterMap[item.theaterId].city && `, ${theaterMap[item.theaterId].city}`}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.itemSub}>
                      🏢 Theater ID: {item.theaterId}
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            {(item?.createdAt || item?.updatedAt) && (
              <View style={styles.dateContainer}>
                {item?.createdAt && (
                  <Text style={styles.dateInfo}>
                    Tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                )}
                {item?.updatedAt && item.updatedAt !== item.createdAt && (
                  <Text style={styles.dateInfo}>
                    Cập nhật: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
      />
      
      {/* Pagination Controls */}
      {pagination.totalElements > 0 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationInfo}>
            Trang {(pagination.number || currentPage) + 1} / {pagination.totalPages || 1} 
            ({pagination.totalElements || 0} phòng chiếu)
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
          
          {/* Thêm thông tin debug khi cần */}
          {__DEV__ && (
            <Text style={styles.debugInfo}>
              Debug: API page={pagination.number}, Local page={currentPage}, 
              First={String(pagination.first)}, Last={String(pagination.last)}, 
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
    marginBottom: 12
  },
  itemDetails: {
    marginBottom: 12
  },
  itemInfo: { 
    color: '#555', 
    fontSize: 14, 
    marginBottom: 6,
    lineHeight: 20
  },
  itemSub: { 
    color: '#666', 
    fontSize: 13,
    marginBottom: 4
  },
  theaterInfo: {
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF'
  },
  theaterName: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  theaterAddress: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18
  },
  dateContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 8
  },
  dateInfo: { 
    color: '#999', 
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 2
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
