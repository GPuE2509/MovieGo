import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
      <LinearGradient
        colors={['#b91c1c', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý người dùng</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b91c1c" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color="#b91c1c" />
            <Text style={styles.errorText}>
              Có lỗi xảy ra: {String(error?.message || error)}
            </Text>
          </View>
        ) : (
          <>
            {data?.data && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  Tổng cộng: <Text style={styles.highlight}>{data.data.totalElements}</Text> người dùng
                </Text>
                <Text style={styles.statsText}>
                  Hiển thị: <Text style={styles.highlight}>{data.data.numberOfElements}</Text> / {data.data.size} trên trang
                </Text>
              </View>
            )}
            
            <FlatList
              data={data?.data?.content || []}
              keyExtractor={(item, idx) => String(item?.id ?? idx)}
              renderItem={renderUserItem}
              contentContainerStyle={styles.listContent}
              ListFooterComponent={renderPagination}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Không có người dùng nào</Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  highlight: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  item: { 
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#b91c1c',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  itemTitle: { 
    fontWeight: '600', 
    fontSize: 16, 
    flex: 1,
    color: '#1f2937',
  },
  itemEmail: { 
    fontWeight: '500', 
    fontSize: 14, 
    color: '#3b82f6', 
    marginBottom: 6,
    textDecorationLine: 'underline',
  },
  itemSub: { 
    color: '#6b7280', 
    marginTop: 4, 
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 70,
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  viewDetail: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginTop: 16,
    gap: 16,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pageButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9ca3af',
  },
  pageInfo: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    color: '#b91c1c',
    textAlign: 'center',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 20,
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
