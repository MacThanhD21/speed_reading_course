/**
 * Script để kiểm tra collections trong database
 * Chạy: node server/utils/checkCollections.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
// Try multiple paths for flexibility
dotenv.config({ path: './.env' });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: '../.env' });
}

const checkCollections = async () => {
  try {
    // Kết nối database
    let mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri && !mongoUri.match(/\/[^\/\?]+(\?|$)/)) {
      const dbName = process.env.DB_NAME || 'speedreading_admin';
      mongoUri = mongoUri.replace(/\/$/, '') + '/' + dbName;
      if (!mongoUri.includes('?')) {
        mongoUri += '?retryWrites=true&w=majority';
      }
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    const dbName = db.databaseName;

    console.log('\n📊 DATABASE INFORMATION:');
    console.log('========================');
    console.log(`Database Name: ${dbName}`);
    console.log(`Connection String: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`); // Hide password
    console.log('\n📁 COLLECTIONS:');
    console.log('========================');

    // List all collections
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️  Không có collections nào trong database này!');
      console.log('\n💡 Gợi ý:');
      console.log('   1. Kiểm tra xem có đang connect đúng database không');
      console.log('   2. Kiểm tra MONGODB_URI trong .env file');
      console.log('   3. Thử tạo một document để test');
    } else {
      for (const collection of collections) {
        const collectionName = collection.name;
        const count = await db.collection(collectionName).countDocuments();
        
        console.log(`\n✅ Collection: ${collectionName}`);
        console.log(`   Documents: ${count}`);
        
        if (count > 0) {
          // Show sample document
          const sample = await db.collection(collectionName).findOne();
          console.log(`   Sample ID: ${sample._id}`);
          if (sample.createdAt) {
            console.log(`   Created: ${new Date(sample.createdAt).toLocaleString()}`);
          }
        }
      }
    }

    // Check specifically for ReadingSession and QuizResult
    console.log('\n🔍 CHECKING SPECIFIC COLLECTIONS:');
    console.log('========================');
    
    // Mongoose converts model names to lowercase and pluralizes
    // ReadingSession → readingsessions (lowercase + plural)
    // QuizResult → quizresults (lowercase + plural)
    const possibleNames = [
      'readingsessions',
      'readingsession', 
      'reading_sessions',
      'reading_sessions',
      'quizresults',
      'quizresult',
      'quiz_results',
      'quiz_result'
    ];

    for (const name of possibleNames) {
      try {
        const exists = await db.collection(name).countDocuments({}, { limit: 1 });
        if (exists > 0 || await db.listCollections({ name }).hasNext()) {
          const count = await db.collection(name).countDocuments();
          console.log(`✅ Found: ${name} (${count} documents)`);
          
          if (count > 0) {
            const sample = await db.collection(name).findOne();
            console.log(`   Sample:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...');
          }
        }
      } catch (e) {
        // Collection doesn't exist
      }
    }

    // Check users and contacts for comparison
    console.log('\n📋 EXISTING COLLECTIONS FOR REFERENCE:');
    console.log('========================');
    const knownCollections = ['users', 'contacts'];
    for (const name of knownCollections) {
      try {
        const count = await db.collection(name).countDocuments();
        console.log(`✅ ${name}: ${count} documents`);
      } catch (e) {
        console.log(`❌ ${name}: Not found`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkCollections();

