/**
 * Test script for Coupon Feature APIs
 * Run with: node test-coupon-apis.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

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
const testGetAllCoupons = async () => {
  console.log('\n🧪 Testing GET /admin/coupons (Admin)');
  const result = await apiCall('GET', '/admin/coupons');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetAllCouponsWithPagination = async () => {
  console.log('\n🧪 Testing GET /admin/coupons with pagination');
  const result = await apiCall('GET', '/admin/coupons?page=0&pageSize=5');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetAllCouponsWithSearch = async () => {
  console.log('\n🧪 Testing GET /admin/coupons with search');
  const result = await apiCall('GET', '/admin/coupons?search=50k');
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testCreateCoupon = async () => {
  console.log('\n🧪 Testing POST /admin/coupon/create');
  const couponData = {
    name: 'Voucher Giảm 50k',
    code: '50KQUAGIANGSINH',
    value: 50000,
    exchange_point: 100
  };
  
  const result = await apiCall('POST', '/admin/coupon/create', couponData);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testUpdateCoupon = async (couponId = 1) => {
  console.log('\n🧪 Testing PUT /admin/coupon/update/' + couponId);
  const couponData = {
    name: 'Voucher Giảm 50k Updated',
    code: '50KQUAGIANGSINH_UPDATED',
    value: 60000,
    exchange_point: 120
  };
  
  const result = await apiCall('PUT', `/admin/coupon/update/${couponId}`, couponData);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testDeleteCoupon = async (couponId = 1) => {
  console.log('\n🧪 Testing DELETE /admin/coupon/delete/' + couponId);
  const result = await apiCall('DELETE', `/admin/coupon/delete/${couponId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetAvailableCoupons = async (userId = 1) => {
  console.log('\n🧪 Testing GET /user/available-coupons/' + userId);
  const result = await apiCall('GET', `/user/available-coupons/${userId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testGetMyCoupons = async (userId = 1) => {
  console.log('\n🧪 Testing GET /user/my-coupons/' + userId);
  const result = await apiCall('GET', `/user/my-coupons/${userId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testExchangeCoupon = async (couponId = 1, userId = 1) => {
  console.log('\n🧪 Testing POST /user/exchange/' + couponId + '/' + userId);
  const result = await apiCall('POST', `/user/exchange/${couponId}/${userId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testCanExchangeCoupon = async (couponId = 1, userId = 1) => {
  console.log('\n🧪 Testing GET /user/can-exchange/' + couponId + '/' + userId);
  const result = await apiCall('GET', `/user/can-exchange/${couponId}/${userId}`);
  
  if (result.success) {
    console.log('✅ Success:', result.data);
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  return result;
};

const testValidationErrors = async () => {
  console.log('\n🧪 Testing validation errors');
  
  // Test invalid coupon data
  const invalidCouponData = {
    name: '', // Empty name
    code: '', // Empty code
    value: -1, // Negative value
    exchange_point: -1 // Negative exchange point
  };
  
  const invalidCouponResult = await apiCall('POST', '/admin/coupon/create', invalidCouponData);
  console.log('Invalid coupon data test:', invalidCouponResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid pagination
  const invalidPaginationResult = await apiCall('GET', '/admin/coupons?page=-1&pageSize=200');
  console.log('Invalid pagination test:', invalidPaginationResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid user ID
  const invalidUserIdResult = await apiCall('GET', '/user/available-coupons/invalid');
  console.log('Invalid user ID test:', invalidUserIdResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid coupon ID
  const invalidCouponIdResult = await apiCall('GET', '/user/can-exchange/invalid/1');
  console.log('Invalid coupon ID test:', invalidCouponIdResult.success ? '❌ Should fail' : '✅ Correctly failed');
};

const testNonExistentCoupon = async () => {
  console.log('\n🧪 Testing GET non-existent coupon');
  const result = await apiCall('GET', '/user/can-exchange/999999/1');
  
  if (result.success) {
    console.log('❌ Should fail for non-existent coupon');
  } else {
    console.log('✅ Correctly failed for non-existent coupon');
  }
  
  return result;
};

const testNonExistentUser = async () => {
  console.log('\n🧪 Testing GET non-existent user');
  const result = await apiCall('GET', '/user/available-coupons/999999');
  
  if (result.success) {
    console.log('❌ Should fail for non-existent user');
  } else {
    console.log('✅ Correctly failed for non-existent user');
  }
  
  return result;
};

const testDuplicateCouponCode = async () => {
  console.log('\n🧪 Testing duplicate coupon code');
  const couponData = {
    name: 'Duplicate Test',
    code: 'DUPLICATE_CODE', // This should already exist
    value: 10000,
    exchange_point: 50
  };
  
  const result = await apiCall('POST', '/admin/coupon/create', couponData);
  
  if (result.success) {
    console.log('❌ Should fail for duplicate code');
  } else {
    console.log('✅ Correctly failed for duplicate code');
  }
  
  return result;
};

const testInsufficientPoints = async () => {
  console.log('\n🧪 Testing insufficient points for exchange');
  // Assuming user 1 has 0 points and coupon 1 requires 100 points
  const result = await apiCall('POST', '/user/exchange/1/1');
  
  if (result.success) {
    console.log('❌ Should fail for insufficient points');
  } else {
    console.log('✅ Correctly failed for insufficient points');
  }
  
  return result;
};

const testAlreadyHaveCoupon = async () => {
  console.log('\n🧪 Testing exchange coupon user already has');
  // First exchange the coupon
  await apiCall('POST', '/user/exchange/1/1');
  
  // Try to exchange again
  const result = await apiCall('POST', '/user/exchange/1/1');
  
  if (result.success) {
    console.log('❌ Should fail for already having coupon');
  } else {
    console.log('✅ Correctly failed for already having coupon');
  }
  
  return result;
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Coupon Feature API Tests');
  console.log('====================================');
  
  try {
    // Test 1: Get all coupons (basic)
    await testGetAllCoupons();
    
    // Test 2: Get all coupons with pagination
    await testGetAllCouponsWithPagination();
    
    // Test 3: Get all coupons with search
    await testGetAllCouponsWithSearch();
    
    // Test 4: Create coupon
    await testCreateCoupon();
    
    // Test 5: Update coupon
    await testUpdateCoupon();
    
    // Test 6: Get available coupons for user
    await testGetAvailableCoupons();
    
    // Test 7: Get user's coupons
    await testGetMyCoupons();
    
    // Test 8: Check if can exchange coupon
    await testCanExchangeCoupon();
    
    // Test 9: Exchange coupon
    await testExchangeCoupon();
    
    // Test 10: Test validation errors
    await testValidationErrors();
    
    // Test 11: Test non-existent coupon
    await testNonExistentCoupon();
    
    // Test 12: Test non-existent user
    await testNonExistentUser();
    
    // Test 13: Test duplicate coupon code
    await testDuplicateCouponCode();
    
    // Test 14: Test insufficient points
    await testInsufficientPoints();
    
    // Test 15: Test already have coupon
    await testAlreadyHaveCoupon();
    
    // Test 16: Delete coupon (last test)
    await testDeleteCoupon();
    
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
  testGetAllCoupons, 
  testCreateCoupon, 
  testUpdateCoupon, 
  testDeleteCoupon,
  testGetAvailableCoupons,
  testGetMyCoupons,
  testExchangeCoupon,
  testCanExchangeCoupon
};
