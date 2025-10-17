/**
 * Test script for Public Movie Selection APIs
 * Run with: node test-public-movie-apis.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1/movies';

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
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
const testGetMoviesWithShowtimes = async () => {
  console.log('\n🧪 Testing GET /movies (Public)');
  const result = await apiCall('GET', '');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMoviesWithDateFilter = async () => {
  console.log('\n🧪 Testing GET /movies with date filter');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await apiCall('GET', `?date=${tomorrow.toISOString()}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMoviesWithTheaterFilter = async () => {
  console.log('\n🧪 Testing GET /movies with theater filter');
  const result = await apiCall('GET', '?theaterId=1');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMoviesWithPagination = async () => {
  console.log('\n🧪 Testing GET /movies with pagination');
  const result = await apiCall('GET', '?page=0&size=5');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMovieDetails = async (movieId = 1) => {
  console.log('\n🧪 Testing GET /movies/' + movieId + ' (Public)');
  const result = await apiCall('GET', `/${movieId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMoviesShowing = async () => {
  console.log('\n🧪 Testing GET /movies/showing (Public)');
  const result = await apiCall('GET', '/showing');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMoviesComing = async () => {
  console.log('\n🧪 Testing GET /movies/coming (Public)');
  const result = await apiCall('GET', '/coming');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMovieTrailer = async (movieId = 1) => {
  console.log('\n🧪 Testing GET /movies/' + movieId + '/trailer (Public)');
  const result = await apiCall('GET', `/${movieId}/trailer`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testValidationErrors = async () => {
  console.log('\n🧪 Testing validation errors');
  
  // Test invalid page
  const invalidPageResult = await apiCall('GET', '?page=-1');
  console.log('Invalid page test:', invalidPageResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid size
  const invalidSizeResult = await apiCall('GET', '?size=200');
  console.log('Invalid size test:', invalidSizeResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid date
  const invalidDateResult = await apiCall('GET', '?date=invalid-date');
  console.log('Invalid date test:', invalidDateResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid theater ID
  const invalidTheaterResult = await apiCall('GET', '?theaterId=invalid');
  console.log('Invalid theater ID test:', invalidTheaterResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid movie ID
  const invalidMovieResult = await apiCall('GET', '/invalid');
  console.log('Invalid movie ID test:', invalidMovieResult.success ? '❌ Should fail' : '✅ Correctly failed');
};

const testNonExistentMovie = async () => {
  console.log('\n🧪 Testing GET non-existent movie');
  const result = await apiCall('GET', '/999999');
  
  if (result.success) {
    console.log('❌ Should fail for non-existent movie');
  } else {
    console.log('✅ Correctly failed for non-existent movie');
  }
  
  return result;
};

const testNonExistentTrailer = async () => {
  console.log('\n🧪 Testing GET trailer for non-existent movie');
  const result = await apiCall('GET', '/999999/trailer');
  
  if (result.success) {
    console.log('❌ Should fail for non-existent movie');
  } else {
    console.log('✅ Correctly failed for non-existent movie');
  }
  
  return result;
};

const testComplexFilters = async () => {
  console.log('\n🧪 Testing complex filters');
  
  // Test with multiple filters
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await apiCall('GET', `?date=${tomorrow.toISOString()}&theaterId=1&page=0&size=3`);
  
  if (result.success) {
    console.log('✅ Success with complex filters:', result.data);
  } else {
    console.log('❌ Failed with complex filters:', result.error);
  }
  
  return result;
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Public Movie Selection API Tests');
  console.log('============================================');
  
  try {
    // Test 1: Get movies with showtimes (basic)
    await testGetMoviesWithShowtimes();
    
    // Test 2: Get movies with date filter
    await testGetMoviesWithDateFilter();
    
    // Test 3: Get movies with theater filter
    await testGetMoviesWithTheaterFilter();
    
    // Test 4: Get movies with pagination
    await testGetMoviesWithPagination();
    
    // Test 5: Get movie details
    await testGetMovieDetails();
    
    // Test 6: Get movies showing
    await testGetMoviesShowing();
    
    // Test 7: Get movies coming
    await testGetMoviesComing();
    
    // Test 8: Get movie trailer
    await testGetMovieTrailer();
    
    // Test 9: Test complex filters
    await testComplexFilters();
    
    // Test 10: Test validation errors
    await testValidationErrors();
    
    // Test 11: Test non-existent movie
    await testNonExistentMovie();
    
    // Test 12: Test non-existent trailer
    await testNonExistentTrailer();
    
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
  testGetMoviesWithShowtimes, 
  testGetMovieDetails, 
  testGetMoviesShowing, 
  testGetMoviesComing, 
  testGetMovieTrailer 
};
