const { initDatabase, testConnection } = require('../config/database');

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Initialize database tables
  const success = await initDatabase();
  if (success) {
    console.log('✅ All migrations completed successfully!');
  } else {
    console.error('❌ Migrations failed');
    process.exit(1);
  }
  
  process.exit(0);
}

runMigrations().catch(error => {
  console.error('❌ Migration error:', error);
  process.exit(1);
});
