import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AIService from '../services/AIService';

const AIGeneratorScreen = ({ route, navigation }) => {
  const { movieId, movieTitle } = route.params || {};
  
  const [eventTheme, setEventTheme] = useState('Premiere Night');
  const [customTheme, setCustomTheme] = useState('');
  const [useCustomTheme, setUseCustomTheme] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [serviceHealth, setServiceHealth] = useState(null);

  const eventThemes = AIService.getEventThemes();

  useEffect(() => {
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    const health = await AIService.checkHealth();
    setServiceHealth(health);
  };

  const generateContent = async () => {
    if (!movieId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID phim');
      return;
    }

    const selectedTheme = useCustomTheme ? customTheme : eventTheme;
    
    if (!selectedTheme.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chủ đề sự kiện');
      return;
    }

    setLoading(true);
    setGeneratedContent(null);

    try {
      const result = await AIService.generateEventContent(movieId, selectedTheme);
      
      if (result.success) {
        setGeneratedContent(result.data);
        Alert.alert('Thành công', 'Đã tạo nội dung AI thành công!');
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể tạo nội dung AI');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi tạo nội dung AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI Content Generator</Text>
      
      {/* Service Health Status */}
      <View style={styles.healthContainer}>
        <Text style={styles.sectionTitle}>Service Status:</Text>
        <Text style={[
          styles.healthStatus, 
          { color: serviceHealth?.success ? '#4CAF50' : '#F44336' }
        ]}>
          {serviceHealth?.success ? '✅ Online' : '❌ Offline'}
        </Text>
        {serviceHealth?.service && (
          <Text style={styles.healthDetail}>
            {serviceHealth.service} - {serviceHealth.model}
          </Text>
        )}
      </View>

      {/* Movie Info */}
      <View style={styles.movieInfo}>
        <Text style={styles.sectionTitle}>Phim:</Text>
        <Text style={styles.movieTitle}>{movieTitle || 'Không rõ tên phim'}</Text>
        <Text style={styles.movieId}>ID: {movieId || 'Không có ID'}</Text>
      </View>

      {/* Event Theme Selection */}
      <View style={styles.themeContainer}>
        <Text style={styles.sectionTitle}>Chủ đề sự kiện:</Text>
        
        <TouchableOpacity 
          style={styles.themeToggle}
          onPress={() => setUseCustomTheme(!useCustomTheme)}
        >
          <Text style={styles.themeToggleText}>
            {useCustomTheme ? '📝 Tùy chỉnh' : '📋 Chọn sẵn'}
          </Text>
        </TouchableOpacity>

        {useCustomTheme ? (
          <TextInput
            style={styles.customThemeInput}
            placeholder="Nhập chủ đề tùy chỉnh (ví dụ: Christmas Special)"
            value={customTheme}
            onChangeText={setCustomTheme}
            multiline
          />
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventTheme}
              onValueChange={setEventTheme}
              style={styles.picker}
            >
              {eventThemes.map((theme) => (
                <Picker.Item 
                  key={theme} 
                  label={theme} 
                  value={theme}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Generate Button */}
      <TouchableOpacity 
        style={[styles.generateButton, loading && styles.disabledButton]}
        onPress={generateContent}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.generateButtonText}>🤖 Tạo nội dung AI</Text>
        )}
      </TouchableOpacity>

      {/* Generated Content */}
      {generatedContent && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>📄 Nội dung đã tạo:</Text>
          
          {/* Generated Banner Image */}
          {generatedContent.generatedContent.bannerImage && (
            <View style={styles.contentSection}>
              <Text style={styles.contentLabel}>🎨 Banner được tạo:</Text>
              <Image 
                source={{ uri: generatedContent.generatedContent.bannerImage }}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
          )}
          
          <View style={styles.contentSection}>
            <Text style={styles.contentLabel}>📝 Mô tả sự kiện:</Text>
            <Text style={styles.contentText}>{generatedContent.generatedContent.description}</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.contentLabel}>✨ Slogan:</Text>
            <Text style={styles.contentText}>{generatedContent.generatedContent.slogan}</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.contentLabel}>📢 Call to Action:</Text>
            <Text style={styles.contentText}>{generatedContent.generatedContent.callToAction}</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.contentLabel}>🎨 Image Prompt:</Text>
            <Text style={styles.contentText}>{generatedContent.generatedContent.imagePrompt}</Text>
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>⏱️ Thời gian: {new Date(generatedContent.timestamp).toLocaleString()}</Text>
            <Text style={styles.metaText}>🎬 Chủ đề: {generatedContent.eventTheme}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  healthContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  healthStatus: {
    fontSize: 14,
    fontWeight: '600'
  },
  healthDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  movieInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3'
  },
  movieId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  themeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  themeToggle: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12
  },
  themeToggleText: {
    color: '#1976D2',
    fontWeight: '600'
  },
  customThemeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    minHeight: 60
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6
  },
  picker: {
    height: 50
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  contentSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555'
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333'
  },
  metaInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f0f0f0'
  }
});

export default AIGeneratorScreen;