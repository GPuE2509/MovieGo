import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/AdminUserService';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminUsersScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['admin-users', currentPage, pageSize], 
    queryFn: () => getUsers(token, currentPage, pageSize), 
    enabled: !!token 
  });

  // Log all data when it changes
  useEffect(() => {
    if (data) {
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      console.log('Users data:', data?.data?.content);
      console.log('Pagination info:', {
        totalElements: data?.data?.totalElements,
        totalPages: data?.data?.totalPages,
        currentPage: data?.data?.number,
        size: data?.data?.size,
        hasNext: data?.data?.hasNext,
        hasPrevious: data?.data?.hasPrevious,
        numberOfElements: data?.data?.numberOfElements
      });
    }
  }, [data]);

  const handleUserPress = (item) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AdminUserDetail', { userId: item.id });
    } else {
      // Fallback: hiển thị thông tin user trong Alert
      Alert.alert(
        'Thông tin người dùng',
        `ID: ${item.id}\n` +
        `Tên: ${item.firstName} ${item.lastName}\n` +
        `Email: ${item.email}\n` +
        `Trạng thái: ${item.status}\n` +
        `Điểm: ${item.points || 0}\n` +
        `Roles: ${item.roles?.join(', ') || 'Không có'}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>
          {item?.firstName} {item?.lastName}
        </Text>
        <Text style={[styles.statusBadge, getStatusColor(item?.status)]}>
          {item?.status}
        </Text>
      </View>
      <Text style={styles.itemEmail}>{item?.email}</Text>
      <Text style={styles.itemSub}>ID: {item?.id}</Text>
      <Text style={styles.itemSub}>Points: {item?.points || 0}</Text>
      <Text style={styles.itemSub}>Roles: {item?.roles?.join(', ') || 'No roles'}</Text>
      {item?.banUntil && (
        <Text style={[styles.itemSub, { color: 'red' }]}>
          Bị cấm đến: {new Date(item.banUntil).toLocaleDateString('vi-VN')}
        </Text>
      )}
      <Text style={styles.itemSub}>
        Tạo: {new Date(item?.createdAt).toLocaleDateString('vi-VN')}
      </Text>
      <Text style={styles.viewDetail}>
        {navigation && navigation.navigate ? 'Nhấn để xem chi tiết →' : 'ID: ' + item.id}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { backgroundColor: '#e8f5e8', color: '#2e7d2e' };
      case 'BANNED':
        return { backgroundColor: '#ffeaea', color: '#d32f2f' };
      case 'INACTIVE':
        return { backgroundColor: '#fff3e0', color: '#f57c00' };
      default:
        return { backgroundColor: '#f0f0f0', color: '#666' };
    }
  };

  const renderPagination = () => {
    if (!data?.data) return null;
    
    const { totalPages, number: currentPageFromAPI, hasPrevious, hasNext } = data.data;
    
    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, !hasPrevious && styles.disabledButton]}
          onPress={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={!hasPrevious}
        >
          <Text style={[styles.pageButtonText, !hasPrevious && styles.disabledText]}>
            Trước
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.pageInfo}>
          Trang {currentPageFromAPI + 1} / {totalPages}
        </Text>
        
        <TouchableOpacity
          style={[styles.pageButton, !hasNext && styles.disabledButton]}
          onPress={() => setCurrentPage(prev => prev + 1)}
          disabled={!hasNext}
        >
          <Text style={[styles.pageButtonText, !hasNext && styles.disabledText]}>
            Sau
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý người dùng</Text>
      
      {data?.data && (
        <Text style={styles.subtitle}>
          Tổng cộng: {data.data.totalElements} người dùng | Hiển thị {data.data.numberOfElements} / {data.data.size} trên trang
        </Text>
      )}
      
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
      
      <FlatList
        data={data?.data?.content || []}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={renderUserItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListFooterComponent={renderPagination}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 16 },
  item: { 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 8
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  itemTitle: { fontWeight: '600', fontSize: 16, flex: 1 },
  itemEmail: { fontWeight: '500', fontSize: 14, color: '#007AFF', marginBottom: 4 },
  itemSub: { color: '#666', marginTop: 2, fontSize: 14 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 60
  },
  viewDetail: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'right'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginTop: 16
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  pageButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  disabledText: {
    color: '#999'
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: '500'
  }
});
