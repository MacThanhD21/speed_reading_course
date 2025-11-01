import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Đảm bảo connection string có database name
    let mongoUri = process.env.MONGODB_URI;
    
    // Nếu connection string không có database name, thêm vào
    if (mongoUri && !mongoUri.match(/\/[^\/\?]+(\?|$)/)) {
      // Nếu không có database name trong URI, thêm speedreading_admin
      const dbName = process.env.DB_NAME || 'speedreading_admin';
      mongoUri = mongoUri.replace(/\/$/, '') + '/' + dbName;
      if (!mongoUri.includes('?')) {
        mongoUri += '?retryWrites=true&w=majority';
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Log warning nếu database name không phải là speedreading_admin
    if (conn.connection.name === 'test') {
      console.warn('⚠️  WARNING: Đang sử dụng database "test". Hãy kiểm tra MONGODB_URI trong .env file!');
      console.warn('⚠️  Connection string nên có dạng: mongodb+srv://user:pass@cluster.mongodb.net/speedreading_admin');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err}`);
});

export default connectDB;

