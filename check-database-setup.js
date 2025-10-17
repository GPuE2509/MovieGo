/**
 * Database Setup Checker
 * Run with: node check-database-setup.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabaseSetup = async () => {
  console.log('🔍 Checking Database Setup');
  console.log('==========================');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sdn302'
    });
    
    console.log('✅ Database connection successful');
    
    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === (process.env.DB_NAME || 'sdn302'));
    
    if (dbExists) {
      console.log('✅ Database exists');
    } else {
      console.log('❌ Database does not exist');
      console.log('   Please create database:', process.env.DB_NAME || 'sdn302');
      return;
    }
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    console.log('\n📋 Checking Required Tables:');
    
    const requiredTables = [
      'movies', 'genres', 'movie_genre', 'news', 'theaters', 
      'screens', 'showtimes', 'users', 'coupons', 'user_coupons',
      'festivals', 'promotions', 'ticket_prices', 'banners'
    ];
    
    const missingTables = [];
    const existingTables = [];
    
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`✅ ${table}`);
        existingTables.push(table);
      } else {
        console.log(`❌ ${table} - MISSING`);
        missingTables.push(table);
      }
    }
    
    // Check data in existing tables
    console.log('\n📊 Checking Data in Tables:');
    
    for (const table of existingTables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        console.log(`✅ ${table}: ${count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Error checking data - ${error.message}`);
      }
    }
    
    // Check associations
    console.log('\n🔗 Checking Associations:');
    
    // Check movie-genre associations
    try {
      const [movieGenreRows] = await connection.execute('SELECT COUNT(*) as count FROM movie_genre');
      console.log(`✅ movie_genre: ${movieGenreRows[0].count} associations`);
    } catch (error) {
      console.log(`❌ movie_genre: ${error.message}`);
    }
    
    // Check user-coupon associations
    try {
      const [userCouponRows] = await connection.execute('SELECT COUNT(*) as count FROM user_coupons');
      console.log(`✅ user_coupons: ${userCouponRows[0].count} associations`);
    } catch (error) {
      console.log(`❌ user_coupons: ${error.message}`);
    }
    
    // Check showtime associations
    try {
      const [showtimeRows] = await connection.execute('SELECT COUNT(*) as count FROM showtimes');
      console.log(`✅ showtimes: ${showtimeRows[0].count} records`);
    } catch (error) {
      console.log(`❌ showtimes: ${error.message}`);
    }
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`✅ Existing tables: ${existingTables.length}/${requiredTables.length}`);
    console.log(`❌ Missing tables: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('\n💡 You may need to:');
      console.log('   1. Create missing tables');
      console.log('   2. Import data from Spring Boot');
      console.log('   3. Run database migrations');
    }
    
    if (existingTables.length === requiredTables.length) {
      console.log('\n🎉 Database setup is complete!');
    } else {
      console.log('\n⚠️  Database setup is incomplete.');
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n💡 Please check:');
    console.log('   1. MySQL service is running');
    console.log('   2. Database credentials in .env file');
    console.log('   3. Database exists');
    console.log('   4. User has proper permissions');
  }
};

// Run check if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabaseSetup();
}

export { checkDatabaseSetup };
