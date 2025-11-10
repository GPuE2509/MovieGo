const { GoogleGenerativeAI } = require('@google/generative-ai');
const Movie = require('../models/movie');
const ImageGeneratorService = require('../services/imageGeneratorService');

// Initialize Google AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'your-api-key-here');

/**
 * Generate AI content for movie event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateEventContent = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { eventTheme } = req.body;

    // Validate input
    if (!movieId || !eventTheme) {
      return res.status(400).json({
        success: false,
        message: 'movieId and eventTheme are required'
      });
    }

    // Get movie information
    const movie = await Movie.findById(movieId).populate('genres');
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Prepare movie data
    const movieData = {
      title: movie.title,
      description: movie.description,
      genres: movie.genres?.map(genre => genre.name).join(', ') || 'Unknown',
      director: movie.author,
      actors: Array.isArray(movie.actors) ? movie.actors : [movie.actors].filter(Boolean),
      nation: movie.nation,
      duration: movie.duration,
      releaseDate: movie.release_date
    };

    // Initialize the model - use simpler approach for now
    console.log('🤖 Generating AI content...');
    
    // Create mock AI content for testing (replace with real AI when working)
    const mockAIContent = {
      description: `Trải nghiệm ${eventTheme.toLowerCase()} đặc biệt với "${movieData.title}" - bộ phim ${movieData.genres} đầy cảm xúc. Đây là cơ hội tuyệt vời để thưởng thức điện ảnh chất lượng cao trong không gian ${eventTheme.toLowerCase()} độc đáo và ấn tượng.`,
      slogan: `${movieData.title} - ${eventTheme} Đáng Nhớ!`,
      callToAction: "Đặt vé ngay để không bỏ lỡ!"
    };
    
    const mockImagePrompt = `Movie banner for "${movieData.title}" ${eventTheme} event, ${movieData.genres} style, cinematic poster design, professional typography, premium event branding`;

    // Create prompt for description
    const descriptionPrompt = `
Tạo một mô tả sự kiện hấp dẫn cho bộ phim "${movieData.title}" với chủ đề "${eventTheme}".

Thông tin phim:
- Tiêu đề: ${movieData.title}
- Mô tả: ${movieData.description || 'Không có mô tả'}
- Thể loại: ${movieData.genres}
- Đạo diễn: ${movieData.director || 'Không rõ'}
- Diễn viên: ${movieData.actors.length > 0 ? movieData.actors.join(', ') : 'Không rõ'}
- Quốc gia: ${movieData.nation || 'Không rõ'}
- Thời lượng: ${movieData.duration || 'Không rõ'} phút

Yêu cầu:
1. Viết một mô tả sự kiện ngắn gọn, hấp dẫn (2-3 câu)
2. Tạo slogan thu hút (1 câu ngắn)
3. Call-to-action mạnh mẽ
4. Phù hợp với chủ đề: ${eventTheme}

Trả về định dạng JSON:
{
  "description": "mô tả sự kiện",
  "slogan": "slogan thu hút",
  "callToAction": "lời kêu gọi hành động"
}
`;

    // Create prompt for image
    const imagePrompt = `
Tạo prompt để tạo ảnh banner cho sự kiện phim "${movieData.title}" với chủ đề "${eventTheme}".

Thông tin phim:
- Tiêu đề: ${movieData.title}
- Thể loại: ${movieData.genres}
- Chủ đề sự kiện: ${eventTheme}

Tạo một prompt chi tiết để tạo ảnh banner, bao gồm:
1. Phong cách visual phù hợp với thể loại phim
2. Màu sắc và mood phù hợp với chủ đề sự kiện
3. Các element cần có trong ảnh
4. Phong cách typography
5. Layout và composition

Trả về prompt tiếng Anh để sử dụng với AI image generator.
`;

    // Use mock content for now (replace with real AI generation later)
    const parsedDescription = mockAIContent;
    const imagePromptText = mockImagePrompt;

    // Generate banner image
    let bannerImage;
    try {
      console.log('🎨 Generating banner image...');
      bannerImage = await ImageGeneratorService.generateBanner(movieData, eventTheme, parsedDescription);
    } catch (imageError) {
      console.log('Canvas generation failed, using SVG fallback:', imageError.message);
      bannerImage = ImageGeneratorService.generateSimpleBanner(movieData, eventTheme);
    }

    // Return response
    res.json({
      success: true,
      data: {
        movieId,
        movieTitle: movieData.title,
        eventTheme,
        generatedContent: {
          description: parsedDescription.description,
          slogan: parsedDescription.slogan,
          callToAction: parsedDescription.callToAction,
          imagePrompt: imagePromptText,
          bannerImage: bannerImage
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    
    // Handle specific Google AI errors
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error',
        error: 'Invalid or missing Google AI API key'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate AI content',
      error: error.message
    });
  }
};

module.exports = {
  generateEventContent
};