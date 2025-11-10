import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, updateUserStatus } from '../services/AdminUserService';
import { AuthContext } from '../context/AuthContext';

export default function AdminUserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [banUntil, setBanUntil] = useState('');

  // Fetch user details
  const { data: userDetail, isLoading, error, refetch } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => getUserById(userId, token),
    enabled: !!token && !!userId
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statusData, token }) => updateUserStatus(id, statusData, token),
    onSuccess: () => {
      Alert.alert('Thành công', 'Cập nhật trạng thái người dùng thành công');
      setModalVisible(false);
      refetch();
      // Refresh the users list
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  });

  useEffect(() => {
    if (userDetail?.data) {
      console.log('User Detail Data:', JSON.stringify(userDetail, null, 2));
    }
  }, [userDetail]);

  const handleStatusUpdate = () => {
    if (!newStatus) {
      Alert.alert('Lỗi', 'Vui lòng chọn trạng thái');
      return;
    }

    const statusData = { status: newStatus };
    
    // If status is banned and banUntil is provided
    if (newStatus === 'BANNED' && banUntil) {
      statusData.banUntil = banUntil;
    }

    updateStatusMutation.mutate({
      id: userId,
      statusData,
      token
    });
  };

  const openStatusModal = () => {
    setNewStatus(userDetail?.data?.status || '');
    setBanUntil('');
    setModalVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Lỗi: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = userDetail?.data;

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chi tiết người dùng</Text>
          <TouchableOpacity 
            style={styles.updateButton} 
            onPress={openStatusModal}
          >
            <Text style={styles.updateButtonText}>Cập nhật trạng thái</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{user.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ tên:</Text>
            <Text style={styles.value}>{user.firstName} {user.lastName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{user.phone || 'Chưa có'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>{user.address || 'Chưa có'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text style={[
              styles.value, 
              styles.status,
              { color: user.status === 'ACTIVE' ? 'green' : user.status === 'BANNED' ? 'red' : 'orange' }
            ]}>
              {user.status}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Điểm:</Text>
            <Text style={styles.value}>{user.points || 0}</Text>
          </View>

          {user.banUntil && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Bị cấm đến:</Text>
              <Text style={[styles.value, { color: 'red' }]}>
                {new Date(user.banUntil).toLocaleString('vi-VN')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quyền hạn</Text>
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role, index) => (
              <View key={index} style={styles.roleItem}>
                <Text style={styles.roleText}>{role}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRoles}>Chưa có quyền hạn</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tạo tài khoản:</Text>
            <Text style={styles.value}>
              {new Date(user.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Cập nhật lần cuối:</Text>
            <Text style={styles.value}>
              {new Date(user.updatedAt).toLocaleString('vi-VN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
            
            <Text style={styles.modalLabel}>Trạng thái:</Text>
            <View style={styles.statusButtons}>
              {['ACTIVE', 'INACTIVE', 'BANNED'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    newStatus === status && styles.selectedStatusButton
                  ]}
                  onPress={() => setNewStatus(status)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newStatus === status && styles.selectedStatusButtonText
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {newStatus === 'BANNED' && (
              <>
                <Text style={styles.modalLabel}>Cấm đến (tùy chọn):</Text>
                <TextInput
                  style={styles.input}
                  value={banUntil}
                  onChangeText={setBanUntil}
                  placeholder="2025-12-31T23:59:59.999Z"
                  placeholderTextColor="#999"
                />
                <Text style={styles.helpText}>
                  Định dạng: YYYY-MM-DDTHH:mm:ss.sssZ
                </Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, updateStatusMutation.isLoading && styles.disabledButton]}
                onPress={handleStatusUpdate}
                disabled={updateStatusMutation.isLoading}
              >
                {updateStatusMutation.isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Cập nhật</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  status: {
    fontWeight: '600',
  },
  roleItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  noRoles: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedStatusButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedStatusButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  confirmButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});