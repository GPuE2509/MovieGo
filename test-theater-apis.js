/**
 * Test script for Theater Management APIs
 * Run with: node test-theater-apis.js
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8080/api/v1';
const ADMIN_BASE_URL = 'http://localhost:8080/api/v1/admin';
const API_KEY = 'your-admin-token-here'; // Replace with actual admin token

// Test data
const testTheater = {
  name: 'Test Cinema World',
  location: '123 Test Street, Test City',
  phone: '19006017',
  latitude: 10.8015,
  longitude: 106.6367,
  state: 'Test State'
};

const updatedTheater = {
  name: 'Updated Cinema World',
  location: '456 Updated Street, Updated City',
  phone: '19006018',
  latitude: 10.8016,
  longitude: 106.6368,
  state: 'Updated State'
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
const testGetAllTheaters = async () => {
  console.log('\n🧪 Testing GET /theaters (Public)');
  const result = await apiCall('GET', '/theaters');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetTheatersNear = async () => {
  console.log('\n🧪 Testing GET /theaters-near (Public)');
  const result = await apiCall('GET', '/theaters-near?lat=10.8015&lon=106.6367&radius=5&limit=10');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testAdminGetAllTheaters = async () => {
  console.log('\n🧪 Testing GET /admin/theaters (Admin)');
  const result = await adminApiCall('GET', '/theaters');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testCreateTheater = async () => {
  console.log('\n🧪 Testing POST /admin/theater/create (Admin)');
  
  // Create form data
  const formData = new FormData();
  formData.append('name', testTheater.name);
  formData.append('location', testTheater.location);
  formData.append('phone', testTheater.phone);
  formData.append('latitude', testTheater.latitude.toString());
  formData.append('longitude', testTheater.longitude.toString());
  formData.append('state', testTheater.state);
  
  // Add a test image if available
  const testImagePath = path.join(process.cwd(), 'test-image.jpg');
  if (fs.existsSync(testImagePath)) {
    formData.append('image', fs.createReadStream(testImagePath));
  }
  
  const result = await adminApiCall('POST', '/theater/create', formData, {
    'Content-Type': 'multipart/form-data'
  });
  
  if (result.success) {
    console.log('✅ Success:', result.data);
    return result.data.data.id; // Return created theater ID
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
};

const testUpdateTheater = async (theaterId) => {
  if (!theaterId) {
    console.log('❌ No theater ID provided for update test');
    return;
  }
  
  console.log('\n🧪 Testing PUT /admin/theater/update/' + theaterId + ' (Admin)');
  
  // Create form data
  const formData = new FormData();
  formData.append('name', updatedTheater.name);
  formData.append('location', updatedTheater.location);
  formData.append('phone', updatedTheater.phone);
  formData.append('latitude', updatedTheater.latitude.toString());
  formData.append('longitude', updatedTheater.longitude.toString());
  formData.append('state', updatedTheater.state);
  
  const result = await adminApiCall('PUT', `/theater/update/${theaterId}`, formData, {
    'Content-Type': 'multipart/form-data'
  });
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetTheaterById = async (theaterId) => {
  if (!theaterId) {
    console.log('❌ No theater ID provided for get by ID test');
    return;
  }
  
  console.log('\n🧪 Testing GET /theater/' + theaterId + ' (Public)');
  const result = await apiCall('GET', `/theater/${theaterId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testDeleteTheater = async (theaterId) => {
  if (!theaterId) {
    console.log('❌ No theater ID provided for delete test');
    return;
  }
  
  console.log('\n🧪 Testing DELETE /admin/theater/delete/' + theaterId + ' (Admin)');
  const result = await adminApiCall('DELETE', `/theater/delete/${theaterId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testValidationErrors = async () => {
  console.log('\n🧪 Testing validation errors');
  
  // Test empty name
  const formData = new FormData();
  formData.append('name', '');
  formData.append('location', 'Test location');
  formData.append('phone', '19006017');
  formData.append('latitude', '10.8015');
  formData.append('longitude', '106.6367');
  formData.append('state', 'Test state');
  
  const emptyResult = await adminApiCall('POST', '/theater/create', formData, {
    'Content-Type': 'multipart/form-data'
  });
  console.log('Empty name test:', emptyResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid phone
  const invalidPhoneFormData = new FormData();
  invalidPhoneFormData.append('name', 'Test Theater');
  invalidPhoneFormData.append('location', 'Test location');
  invalidPhoneFormData.append('phone', 'invalid-phone');
  invalidPhoneFormData.append('latitude', '10.8015');
  invalidPhoneFormData.append('longitude', '106.6367');
  invalidPhoneFormData.append('state', 'Test state');
  
  const invalidPhoneResult = await adminApiCall('POST', '/theater/create', invalidPhoneFormData, {
    'Content-Type': 'multipart/form-data'
  });
  console.log('Invalid phone test:', invalidPhoneResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid coordinates
  const invalidCoordFormData = new FormData();
  invalidCoordFormData.append('name', 'Test Theater');
  invalidCoordFormData.append('location', 'Test location');
  invalidCoordFormData.append('phone', '19006017');
  invalidCoordFormData.append('latitude', '999'); // Invalid latitude
  invalidCoordFormData.append('longitude', '106.6367');
  invalidCoordFormData.append('state', 'Test state');
  
  const invalidCoordResult = await adminApiCall('POST', '/theater/create', invalidCoordFormData, {
    'Content-Type': 'multipart/form-data'
  });
  console.log('Invalid coordinates test:', invalidCoordResult.success ? '❌ Should fail' : '✅ Correctly failed');
};

const testPagination = async () => {
  console.log('\n🧪 Testing pagination');
  
  // Test with different page sizes
  const pageResult = await apiCall('GET', '/theaters?page=0&size=5');
  console.log('Pagination test:', pageResult.success ? '✅ Success' : '❌ Failed');
  
  // Test with search
  const searchResult = await apiCall('GET', '/theaters?keyword=cinema');
  console.log('Search test:', searchResult.success ? '✅ Success' : '❌ Failed');
  
  // Test with sorting
  const sortResult = await apiCall('GET', '/theaters?sortBy=name&direction=desc');
  console.log('Sorting test:', sortResult.success ? '✅ Success' : '❌ Failed');
};

const testNearbyTheatersValidation = async () => {
  console.log('\n🧪 Testing nearby theaters validation');
  
  // Test missing coordinates
  const missingCoordResult = await apiCall('GET', '/theaters-near');
  console.log('Missing coordinates test:', missingCoordResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid coordinates
  const invalidCoordResult = await apiCall('GET', '/theaters-near?lat=999&lon=999');
  console.log('Invalid coordinates test:', invalidCoordResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test valid coordinates
  const validResult = await apiCall('GET', '/theaters-near?lat=10.8015&lon=106.6367&radius=5&limit=10');
  console.log('Valid coordinates test:', validResult.success ? '✅ Success' : '❌ Failed');
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Theater Management API Tests');
  console.log('========================================');
  
  try {
    // Test 1: Get all theaters (Public)
    await testGetAllTheaters();
    
    // Test 2: Get theaters near location (Public)
    await testGetTheatersNear();
    
    // Test 3: Get all theaters (Admin)
    await testAdminGetAllTheaters();
    
    // Test 4: Create a new theater
    const createdTheaterId = await testCreateTheater();
    
    // Test 5: Get theater by ID (Public)
    await testGetTheaterById(createdTheaterId);
    
    // Test 6: Update the theater
    await testUpdateTheater(createdTheaterId);
    
    // Test 7: Get all theaters again to see the update
    await testGetAllTheaters();
    
    // Test 8: Test pagination and search
    await testPagination();
    
    // Test 9: Test nearby theaters validation
    await testNearbyTheatersValidation();
    
    // Test 10: Test validation errors
    await testValidationErrors();
    
    // Test 11: Delete the theater
    await testDeleteTheater(createdTheaterId);
    
    // Test 12: Try to get deleted theater (should fail)
    console.log('\n🧪 Testing GET deleted theater');
    const deletedResult = await apiCall('GET', `/theater/${createdTheaterId}`);
    console.log('Deleted theater test:', deletedResult.success ? '❌ Should fail' : '✅ Correctly failed');
    
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
  testGetAllTheaters, 
  testGetTheatersNear, 
  testAdminGetAllTheaters, 
  testCreateTheater, 
  testUpdateTheater, 
  testGetTheaterById, 
  testDeleteTheater 
};
