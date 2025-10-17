/**
 * Test script for Genre Management APIs
 * Run with: node test-genre-apis.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1/admin';
const API_KEY = 'your-admin-token-here'; // Replace with actual admin token

// Test data
const testGenre = {
  genreName: 'Test Action'
};

const updatedGenre = {
  genreName: 'Updated Action'
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
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
const testGetAllGenres = async () => {
  console.log('\n🧪 Testing GET /genres');
  const result = await apiCall('GET', '/genres');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testCreateGenre = async () => {
  console.log('\n🧪 Testing POST /genre/create');
  const result = await apiCall('POST', '/genre/create', testGenre);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
    return result.data.data.id; // Return created genre ID
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
};

const testUpdateGenre = async (genreId) => {
  if (!genreId) {
    console.log('❌ No genre ID provided for update test');
    return;
  }
  
  console.log('\n🧪 Testing PUT /genre/update/' + genreId);
  const result = await apiCall('PUT', `/genre/update/${genreId}`, updatedGenre);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testDeleteGenre = async (genreId) => {
  if (!genreId) {
    console.log('❌ No genre ID provided for delete test');
    return;
  }
  
  console.log('\n🧪 Testing DELETE /genre/delete/' + genreId);
  const result = await apiCall('DELETE', `/genre/delete/${genreId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testValidationErrors = async () => {
  console.log('\n🧪 Testing validation errors');
  
  // Test empty genre name
  const emptyResult = await apiCall('POST', '/genre/create', { genreName: '' });
  console.log('Empty name test:', emptyResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test long genre name
  const longName = 'A'.repeat(101);
  const longResult = await apiCall('POST', '/genre/create', { genreName: longName });
  console.log('Long name test:', longResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test missing genre name
  const missingResult = await apiCall('POST', '/genre/create', {});
  console.log('Missing name test:', missingResult.success ? '❌ Should fail' : '✅ Correctly failed');
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Genre Management API Tests');
  console.log('=====================================');
  
  try {
    // Test 1: Get all genres
    await testGetAllGenres();
    
    // Test 2: Create a new genre
    const createdGenreId = await testCreateGenre();
    
    // Test 3: Update the genre
    await testUpdateGenre(createdGenreId);
    
    // Test 4: Get all genres again to see the update
    await testGetAllGenres();
    
    // Test 5: Test validation errors
    await testValidationErrors();
    
    // Test 6: Delete the genre
    await testDeleteGenre(createdGenreId);
    
    // Test 7: Try to get deleted genre (should fail)
    console.log('\n🧪 Testing GET deleted genre');
    const deletedResult = await apiCall('GET', `/genre/${createdGenreId}`);
    console.log('Deleted genre test:', deletedResult.success ? '❌ Should fail' : '✅ Correctly failed');
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests, testGetAllGenres, testCreateGenre, testUpdateGenre, testDeleteGenre };
