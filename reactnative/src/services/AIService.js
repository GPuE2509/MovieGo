import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000'; // Localhost for testing

class AIService {
  /**
   * Generate event content using AI
   * @param {string} movieId - ID của phim
   * @param {string} eventTheme - Chủ đề sự kiện
   * @returns {Promise<Object>} Generated content
   */
  static async generateEventContent(movieId, eventTheme) {
    try {
      console.log(`🤖 Generating AI content for movie ${movieId} with theme: ${eventTheme}`);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/ai/generate/${movieId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventTheme: eventTheme
        })
      });

      console.log(`📡 AI API Response status: ${response.status}`);
      console.log(`🌐 Request URL: ${API_BASE_URL}/api/v1/ai/generate/${movieId}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ AI API Error:', errorData);
        throw new Error(errorData.message || 'Failed to generate AI content');
      }

      const data = await response.json();
      console.log('✅ AI Content generated successfully:', data.data);

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        throw new Error(data.message || 'AI generation failed');
      }

    } catch (error) {
      console.error('🚫 AIService Error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Check AI service health
   * @returns {Promise<Object>} Service status
   */
  static async checkHealth() {
    try {
      console.log('🔍 Checking AI service health...');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('❤️ AI Service Health:', data);

      return data;

    } catch (error) {
      console.error('💔 AI Health Check Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get popular event themes
   * @returns {Array<string>} List of event themes
   */
  static getEventThemes() {
    return [
      'Premiere Night',
      'Special Screening', 
      'Holiday Special',
      'Family Event',
      'VIP Screening',
      'Student Discount',
      'Weekend Special',
      'Valentine Special',
      'Horror Night',
      'Comedy Night',
      'Action Marathon',
      'Romantic Evening'
    ];
  }

  /**
   * Validate event theme
   * @param {string} theme - Event theme to validate
   * @returns {boolean} Is valid theme
   */
  static isValidEventTheme(theme) {
    const validThemes = this.getEventThemes();
    return validThemes.includes(theme) || (theme && theme.length > 0);
  }
}

export default AIService;