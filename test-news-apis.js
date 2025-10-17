/**
 * Test script for News Management APIs
 * Run with: node test-news-apis.js
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8080/api/v1';
const ADMIN_BASE_URL = 'http://localhost:8080/api/v1/admin';
const API_KEY = 'your-admin-token-here'; // Replace with actual admin token

// Test data
const testNews = {
  title: 'Test News Title',
  content: 'This is test news content for testing purposes.'
};

const updatedNews = {
  title: 'Updated News Title',
  content: 'This is updated news content.'
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
};

// Helper function for admin API calls
const adminApiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${ADMIN_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
};

// Test functions
const testGetAllNews = async () => {
  console.log('\n🧪 Testing GET /get-all-news (Public)');
  const result = await apiCall('GET', '/get-all-news');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetNewsForCarousel = async () => {
  console.log('\n🧪 Testing GET /news/carousel (Public)');
  const result = await apiCall('GET', '/news/carousel');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testAdminGetAllNews = async () => {
  console.log('\n🧪 Testing GET /admin/news (Admin)');
  const result = await adminApiCall('GET', '/news');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testCreateNews = async () => {
  console.log('\n🧪 Testing POST /admin/news/create (Admin)');
  
  // Create form data
  const formData = new FormData();
  formData.append('title', testNews.title);
  formData.append('content', testNews.content);
  
  // Add a test image if available
  const testImagePath = path.join(process.cwd(), 'test-image.jpg');
  if (fs.existsSync(testImagePath)) {
    formData.append('image', fs.createReadStream(testImagePath));
  }
  
  const result = await adminApiCall('POST', '/news/create', formData, {
    'Content-Type': 'multipart/form-data'
  });
  
  if (result.success) {
    console.log('✅ Success:', result.data);
    return result.data.data; // Return created news ID if available
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
};

const testUpdateNews = async (newsId) => {
  if (!newsId) {
    console.log('❌ No news ID provided for update test');
    return;
  }
  
  console.log('\n🧪 Testing PUT /admin/news/update/' + newsId + ' (Admin)');
  
  // Create form data
  const formData = new FormData();
  formData.append('title', updatedNews.title);
  formData.append('content', updatedNews.content);
  
  const result = await adminApiCall('PUT', `/news/update/${newsId}`, formData, {
    'Content-Type': 'multipart/form-data'
  });
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetNewsById = async (newsId) => {
  if (!newsId) {
    console.log('❌ No news ID provided for get by ID test');
    return;
  }
  
  console.log('\n🧪 Testing GET /get-new-by-id/' + newsId + ' (Public)');
  const result = await apiCall('GET', `/get-new-by-id/${newsId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testDeleteNews = async (newsId) => {
  if (!newsId) {
    console.log('❌ No news ID provided for delete test');
    return;
  }
  
  console.log('\n🧪 Testing DELETE /admin/news/delete/' + newsId + ' (Admin)');
  const result = await adminApiCall('DELETE', `/news/delete/${newsId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testValidationErrors = async () => {
  console.log('\n🧪 Testing validation errors');
  
  // Test empty title
  const formData = new FormData();
  formData.append('title', '');
  formData.append('content', 'Test content');
  
  const emptyResult = await adminApiCall('POST', '/news/create', formData, {
    'Content-Type': 'multipart/form-data'
  });
  console.log('Empty title test:', emptyResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test long title
  const longTitleFormData = new FormData();
  longTitleFormData.append('title', 'A'.repeat(256));
  longTitleFormData.append('content', 'Test content');
  
  const longResult = await adminApiCall('POST', '/news/create', longTitleFormData, {
    'Content-Type': 'multipart/form-data'
  });
  console.log('Long title test:', longResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test missing title
  const missingFormData = new FormData();
  missingFormData.append('content', 'Test content');
  
  const missingResult = await adminApiCall('POST', '/news/create', missingFormData, {
    'Content-Type': 'multipart/form-data'
  });
  console.log('Missing title test:', missingResult.success ? '❌ Should fail' : '✅ Correctly failed');
};

const testPagination = async () => {
  console.log('\n🧪 Testing pagination');
  
  // Test with different page sizes
  const pageResult = await apiCall('GET', '/get-all-news?page=0&pageSize=5');
  console.log('Pagination test:', pageResult.success ? '✅ Success' : '❌ Failed');
  
  // Test with search
  const searchResult = await apiCall('GET', '/get-all-news?search=test');
  console.log('Search test:', searchResult.success ? '✅ Success' : '❌ Failed');
  
  // Test with sorting
  const sortResult = await apiCall('GET', '/get-all-news?sortField=createdAt&sortOrder=desc');
  console.log('Sorting test:', sortResult.success ? '✅ Success' : '❌ Failed');
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting News Management API Tests');
  console.log('=====================================');
  
  try {
    // Test 1: Get all news (Public)
    await testGetAllNews();
    
    // Test 2: Get news for carousel (Public)
    await testGetNewsForCarousel();
    
    // Test 3: Get all news (Admin)
    await testAdminGetAllNews();
    
    // Test 4: Create a new news
    const createdNewsId = await testCreateNews();
    
    // Test 5: Get news by ID (Public)
    await testGetNewsById(createdNewsId);
    
    // Test 6: Update the news
    await testUpdateNews(createdNewsId);
    
    // Test 7: Get all news again to see the update
    await testGetAllNews();
    
    // Test 8: Test pagination and search
    await testPagination();
    
    // Test 9: Test validation errors
    await testValidationErrors();
    
    // Test 10: Delete the news
    await testDeleteNews(createdNewsId);
    
    // Test 11: Try to get deleted news (should fail)
    console.log('\n🧪 Testing GET deleted news');
    const deletedResult = await apiCall('GET', `/get-new-by-id/${createdNewsId}`);
    console.log('Deleted news test:', deletedResult.success ? '❌ Should fail' : '✅ Correctly failed');
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { 
  runTests, 
  testGetAllNews, 
  testGetNewsForCarousel, 
  testAdminGetAllNews, 
  testCreateNews, 
  testUpdateNews, 
  testGetNewsById, 
  testDeleteNews 
};
