/**
 * Comprehensive Test Script for All Converted Features
 * Run with: node test-all-features.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { 
      success: true, 
      data: response.data, 
      status: response.status,
      responseTime: response.headers['x-response-time'] || 'N/A'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 0
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🏥 Testing Health Check');
  const result = await apiCall('GET', '/health');
  
  if (result.success) {
    console.log('✅ Server is running:', result.data);
  } else {
    console.log('❌ Server health check failed:', result.error);
  }
  
  return result;
};

const testGenres = async () => {
  console.log('\n🎭 Testing Genres');
  const result = await apiCall('GET', '/genres');
  
  if (result.success) {
    console.log('✅ Genres loaded:', result.data.data?.length || 0, 'items');
  } else {
    console.log('❌ Genres failed:', result.error);
  }
  
  return result;
};

const testMovies = async () => {
  console.log('\n🎬 Testing Movies');
  const result = await apiCall('GET', '/movies');
  
  if (result.success) {
    console.log('✅ Movies loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ Movies failed:', result.error);
  }
  
  return result;
};

const testNews = async () => {
  console.log('\n📰 Testing News');
  const result = await apiCall('GET', '/news');
  
  if (result.success) {
    console.log('✅ News loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ News failed:', result.error);
  }
  
  return result;
};

const testTheaters = async () => {
  console.log('\n🏢 Testing Theaters');
  const result = await apiCall('GET', '/theaters');
  
  if (result.success) {
    console.log('✅ Theaters loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ Theaters failed:', result.error);
  }
  
  return result;
};

const testCoupons = async () => {
  console.log('\n🎫 Testing Coupons');
  const result = await apiCall('GET', '/admin/coupons');
  
  if (result.success) {
    console.log('✅ Coupons loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ Coupons failed:', result.error);
  }
  
  return result;
};

const testMoviesShowing = async () => {
  console.log('\n🎬 Testing Movies Showing');
  const result = await apiCall('GET', '/movies/showing');
  
  if (result.success) {
    console.log('✅ Movies showing loaded:', result.data.data?.length || 0, 'items');
  } else {
    console.log('❌ Movies showing failed:', result.error);
  }
  
  return result;
};

const testMoviesComing = async () => {
  console.log('\n🎬 Testing Movies Coming');
  const result = await apiCall('GET', '/movies/coming');
  
  if (result.success) {
    console.log('✅ Movies coming loaded:', result.data.data?.length || 0, 'items');
  } else {
    console.log('❌ Movies coming failed:', result.error);
  }
  
  return result;
};

const testTheatersNear = async () => {
  console.log('\n🏢 Testing Theaters Near');
  const result = await apiCall('GET', '/theaters-near?lat=21.0285&lng=105.8542&radius=10');
  
  if (result.success) {
    console.log('✅ Theaters near loaded:', result.data.data?.length || 0, 'items');
  } else {
    console.log('❌ Theaters near failed:', result.error);
  }
  
  return result;
};

const testFestivals = async () => {
  console.log('\n🎪 Testing Festivals');
  const result = await apiCall('GET', '/festivals');
  
  if (result.success) {
    console.log('✅ Festivals loaded:', result.data.data?.length || 0, 'items');
  } else {
    console.log('❌ Festivals failed:', result.error);
  }
  
  return result;
};

const testPromotions = async () => {
  console.log('\n🎁 Testing Promotions');
  const result = await apiCall('GET', '/promotions');
  
  if (result.success) {
    console.log('✅ Promotions loaded:', result.data.data?.length || 0, 'items');
  } else {
    console.log('❌ Promotions failed:', result.error);
  }
  
  return result;
};

const testTicketPrices = async () => {
  console.log('\n💰 Testing Ticket Prices');
  const result = await apiCall('GET', '/ticket-prices');
  
  if (result.success) {
    console.log('✅ Ticket prices loaded:', result.data.data?.length || 0, 'items');
  } else {
    console.log('❌ Ticket prices failed:', result.error);
  }
  
  return result;
};

const testAdminGenres = async () => {
  console.log('\n🎭 Testing Admin Genres');
  const result = await apiCall('GET', '/admin/genres');
  
  if (result.success) {
    console.log('✅ Admin genres loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ Admin genres failed:', result.error);
  }
  
  return result;
};

const testAdminMovies = async () => {
  console.log('\n🎬 Testing Admin Movies');
  const result = await apiCall('GET', '/admin/movies');
  
  if (result.success) {
    console.log('✅ Admin movies loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ Admin movies failed:', result.error);
  }
  
  return result;
};

const testAdminNews = async () => {
  console.log('\n📰 Testing Admin News');
  const result = await apiCall('GET', '/admin/news');
  
  if (result.success) {
    console.log('✅ Admin news loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ Admin news failed:', result.error);
  }
  
  return result;
};

const testAdminTheaters = async () => {
  console.log('\n🏢 Testing Admin Theaters');
  const result = await apiCall('GET', '/admin/theaters');
  
  if (result.success) {
    console.log('✅ Admin theaters loaded:', result.data.data?.data?.length || 0, 'items');
  } else {
    console.log('❌ Admin theaters failed:', result.error);
  }
  
  return result;
};

const testCreateGenre = async () => {
  console.log('\n🎭 Testing Create Genre');
  const genreData = {
    name: 'Test Genre ' + Date.now()
  };
  
  const result = await apiCall('POST', '/admin/genre/create', genreData);
  
  if (result.success) {
    console.log('✅ Genre created successfully');
  } else {
    console.log('❌ Genre creation failed:', result.error);
  }
  
  return result;
};

const testCreateCoupon = async () => {
  console.log('\n🎫 Testing Create Coupon');
  const couponData = {
    name: 'Test Coupon ' + Date.now(),
    code: 'TEST_' + Date.now(),
    value: 10000,
    exchange_point: 50
  };
  
  const result = await apiCall('POST', '/admin/coupon/create', couponData);
  
  if (result.success) {
    console.log('✅ Coupon created successfully');
  } else {
    console.log('❌ Coupon creation failed:', result.error);
  }
  
  return result;
};

const testValidationErrors = async () => {
  console.log('\n🧪 Testing Validation Errors');
  
  // Test invalid genre data
  const invalidGenreResult = await apiCall('POST', '/admin/genre/create', { name: '' });
  console.log('Invalid genre test:', invalidGenreResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid coupon data
  const invalidCouponResult = await apiCall('POST', '/admin/coupon/create', { 
    name: '', 
    code: '', 
    value: -1, 
    exchange_point: -1 
  });
  console.log('Invalid coupon test:', invalidCouponResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test invalid pagination
  const invalidPaginationResult = await apiCall('GET', '/admin/movies?page=-1&size=200');
  console.log('Invalid pagination test:', invalidPaginationResult.success ? '❌ Should fail' : '✅ Correctly failed');
};

const testPerformance = async () => {
  console.log('\n⚡ Testing Performance');
  
  const startTime = Date.now();
  const promises = [
    apiCall('GET', '/genres'),
    apiCall('GET', '/movies'),
    apiCall('GET', '/news'),
    apiCall('GET', '/theaters'),
    apiCall('GET', '/movies/showing')
  ];
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  const successCount = results.filter(r => r.success).length;
  const avgTime = totalTime / results.length;
  
  console.log(`✅ Performance test completed:`);
  console.log(`   - Total time: ${totalTime}ms`);
  console.log(`   - Average time per request: ${avgTime.toFixed(2)}ms`);
  console.log(`   - Success rate: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(1)}%)`);
  
  return { totalTime, avgTime, successCount, totalCount: results.length };
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Test Suite');
  console.log('=====================================');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  try {
    // Basic connectivity tests
    const healthResult = await testHealthCheck();
    results.total++;
    if (healthResult.success) results.passed++; else results.failed++;
    
    // Public API tests
    const publicTests = [
      testGenres,
      testMovies,
      testNews,
      testTheaters,
      testMoviesShowing,
      testMoviesComing,
      testTheatersNear,
      testFestivals,
      testPromotions,
      testTicketPrices
    ];
    
    for (const test of publicTests) {
      const result = await test();
      results.total++;
      if (result.success) results.passed++; else results.failed++;
    }
    
    // Admin API tests
    const adminTests = [
      testAdminGenres,
      testAdminMovies,
      testAdminNews,
      testAdminTheaters,
      testCoupons
    ];
    
    for (const test of adminTests) {
      const result = await test();
      results.total++;
      if (result.success) results.passed++; else results.failed++;
    }
    
    // CRUD tests
    const crudTests = [
      testCreateGenre,
      testCreateCoupon
    ];
    
    for (const test of crudTests) {
      const result = await test();
      results.total++;
      if (result.success) results.passed++; else results.failed++;
    }
    
    // Validation tests
    await testValidationErrors();
    
    // Performance tests
    const perfResult = await testPerformance();
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('===============');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${(results.passed/results.total*100).toFixed(1)}%`);
    console.log(`⚡ Average Response Time: ${perfResult.avgTime.toFixed(2)}ms`);
    
    if (results.failed === 0) {
      console.log('\n🎉 All tests passed! Your Node.js backend is working perfectly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { 
  runAllTests, 
  testHealthCheck, 
  testGenres, 
  testMovies, 
  testNews, 
  testTheaters,
  testCoupons,
  testPerformance
};
