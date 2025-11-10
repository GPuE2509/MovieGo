import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllPaymentMethods } from '../services/AdminPaymentService';
import { useNavigation } from '@react-navigation/native';

export default function AdminPaymentsScreen() {
  const { token } = useContext(AuthContext);
  const nav = useNavigation();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-payments', currentPage, pageSize],
    queryFn: () => getAllPaymentMethods({ page: currentPage, size: pageSize }, token),
    enabled: !!token,
  });

  const list = Array.isArray(data) ? data : (data?.data?.data?.content || []);
  const pagination = data?.data?.data || {};

  // Debug log để kiểm tra dữ liệu
  console.log('API Response:', data);
  console.log('Payment Methods list:', list);
  console.log('Pagination:', pagination);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý phương thức thanh toán</Text>
      <View style={{ marginBottom: 8 }}>
        <Button title="Tạo phương thức" onPress={() => nav.navigate('AdminPaymentCreate')} />
      </View>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      <FlatList
        data={Array.isArray(list) ? list : []}
        keyExtractor={(item, idx) => String(item?._id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => nav.navigate('AdminPaymentEdit', { id: item?._id })}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item?.name || `Method #${item?._id}`}</Text>
              <View style={[styles.statusTag, item?.is_active ? styles.activeStatus : styles.inactiveStatus]}>
                <Text style={[styles.statusText, item?.is_active ? styles.activeText : styles.inactiveText]}>
                  {item?.is_active ? '🟢 Hoạt động' : '🔴 Ngưng'}
                </Text>
              </View>
            </View>
            
            {item?.description && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemInfo}>
                💳 Phương thức: {item?.name || 'Không xác định'}
              </Text>
              
              {item?._id && (
                <Text style={styles.itemId}>
                  🆔 ID: {item._id}
                </Text>
              )}
            </View>
            
            {(item?.created_at || item?.updated_at) && (
              <View style={styles.dateContainer}>
                {item?.created_at && (
                  <Text style={styles.dateInfo}>
                    📅 Tạo: {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </Text>
                )}
                {item?.updated_at && item.updated_at !== item.created_at && (
                  <Text style={styles.dateInfo}>
                    🔄 Cập nhật: {new Date(item.updated_at).toLocaleDateString('vi-VN')}
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
            ({pagination.totalElements || 0} phương thức)
          </Text>
          <View style={styles.paginationButtons}>
            <TouchableOpacity 
              style={[styles.paginationButton, (currentPage === 0) && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
            >
              <Text style={[styles.paginationButtonText, (currentPage === 0) && styles.paginationButtonTextDisabled]}>
                Trước
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paginationButton, (currentPage >= (pagination.totalPages - 1)) && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= (pagination.totalPages - 1) || isLoading}
            >
              <Text style={[styles.paginationButtonText, (currentPage >= (pagination.totalPages - 1)) && styles.paginationButtonTextDisabled]}>
                Sau
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Thêm thông tin debug khi cần */}
          {__DEV__ && (
            <Text style={styles.debugInfo}>
              Debug: API page={pagination.number}, Local page={currentPage}, 
              Total pages={pagination.totalPages}, Total elements={pagination.totalElements}
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  itemTitle: { 
    fontWeight: '700', 
    fontSize: 18, 
    color: '#333',
    flex: 1,
    marginRight: 8
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center'
  },
  activeStatus: {
    backgroundColor: '#E8F5E8'
  },
  inactiveStatus: {
    backgroundColor: '#FDE8E8'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  activeText: {
    color: '#2D5A2D'
  },
  inactiveText: {
    color: '#8B2635'
  },
  itemDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20
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
  itemId: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'monospace'
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
