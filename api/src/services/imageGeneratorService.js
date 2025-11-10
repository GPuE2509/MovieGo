const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

class ImageGeneratorService {
  /**
   * Generate banner image for movie event
   * @param {Object} movieData - Movie information
   * @param {string} eventTheme - Event theme
   * @param {Object} generatedContent - AI generated content
   * @returns {Promise<string>} Base64 encoded image
   */
  static async generateBanner(movieData, eventTheme, generatedContent) {
    try {
      // Canvas dimensions
      const width = 1200;
      const height = 675; // 16:9 aspect ratio
      
      // Create canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background gradient based on event theme
      const gradients = {
        'Premiere Night': ['#1a1a2e', '#16213e', '#0f3460'],
        'Special Screening': ['#2c1810', '#8b4513', '#daa520'],
        'Holiday Special': ['#0d4f3c', '#155a4a', '#1f7a8c'],
        'Family Event': ['#ffd89b', '#19547b', '#a8e6cf'],
        'VIP Screening': ['#000000', '#434343', '#ff6b6b'],
        'minion': ['#ffeb3b', '#ff9800', '#ffc107'],
        'default': ['#1e3c72', '#2a5298', '#3f51b5']
      };

      const themeColors = gradients[eventTheme] || gradients['default'];
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, themeColors[0]);
      gradient.addColorStop(0.5, themeColors[1]);
      gradient.addColorStop(1, themeColors[2]);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add overlay pattern
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < width; i += 50) {
        for (let j = 0; j < height; j += 50) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i, j, 2, 2);
        }
      }
      ctx.globalAlpha = 1;

      // Movie title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Wrap long titles
      const title = movieData.title;
      const maxWidth = width - 100;
      const words = title.split(' ');
      let line = '';
      let y = 150;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, width / 2, y);
          line = words[i] + ' ';
          y += 80;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, y);

      // Event theme badge
      const badgeY = y + 60;
      const badgeWidth = 300;
      const badgeHeight = 50;
      const badgeX = (width - badgeWidth) / 2;
      
      // Badge background
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
      
      // Badge text
      ctx.fillStyle = themeColors[1];
      ctx.font = 'bold 24px Arial';
      ctx.shadowBlur = 0;
      ctx.fillText(eventTheme.toUpperCase(), width / 2, badgeY + 32);

      // Description
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 5;
      
      const description = generatedContent.description.substring(0, 150) + '...';
      const descWords = description.split(' ');
      let descLine = '';
      let descY = badgeY + 100;
      
      for (let i = 0; i < descWords.length; i++) {
        const testLine = descLine + descWords[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(descLine, width / 2, descY);
          descLine = descWords[i] + ' ';
          descY += 35;
          if (descY > height - 150) break; // Don't overflow
        } else {
          descLine = testLine;
        }
      }
      if (descY <= height - 150) {
        ctx.fillText(descLine, width / 2, descY);
      }

      // Call to action button
      const buttonY = height - 120;
      const buttonWidth = 400;
      const buttonHeight = 60;
      const buttonX = (width - buttonWidth) / 2;
      
      // Button background
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // Button border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // Button text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.shadowBlur = 0;
      ctx.fillText(generatedContent.callToAction, width / 2, buttonY + 40);

      // Movie details at bottom
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      const details = `${movieData.genres} • ${movieData.duration} phút • ${movieData.nation}`;
      ctx.fillText(details, 50, height - 30);

      // Convert to base64
      const buffer = canvas.toBuffer('image/png');
      const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;
      
      return base64Image;

    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate banner image');
    }
  }

  /**
   * Generate simple template-based banner (fallback)
   * @param {Object} movieData - Movie information
   * @param {string} eventTheme - Event theme
   * @returns {string} Simple HTML/CSS based image URL or base64
   */
  static generateSimpleBanner(movieData, eventTheme) {
    // This would return a simple template-based image
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e3c72;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2a5298;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#grad1)" />
        <text x="600" y="200" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">${movieData.title}</text>
        <rect x="450" y="250" width="300" height="50" fill="rgba(255,255,255,0.9)" />
        <text x="600" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e3c72" text-anchor="middle">${eventTheme.toUpperCase()}</text>
        <text x="600" y="400" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle">Trải nghiệm điện ảnh đỉnh cao</text>
        <rect x="400" y="500" width="400" height="60" fill="#ff4444" stroke="white" stroke-width="3" />
        <text x="600" y="540" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">ĐẶT VÉ NGAY!</text>
      </svg>
    `).toString('base64')}`;
  }
}

module.exports = ImageGeneratorService;