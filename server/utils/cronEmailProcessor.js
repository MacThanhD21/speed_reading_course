/**
 * Cron Job - Email Queue Processor
 * 
 * This script processes pending emails from the queue
 * Should be run every 5-10 minutes via cron job or scheduled task
 * 
 * Usage:
 * - Manual: node server/utils/cronEmailProcessor.js
 * - Cron: Run every 5 minutes (cron expression: every 5 minutes)
 * - PM2: pm2 start cronEmailProcessor.js --name email-processor --cron "every 5 minutes"
 */

import { processEmailQueue } from './emailQueueManager.js';
import connectDB from '../config/database.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

const runEmailProcessor = async () => {
  try {
    console.log(`\n⏰ [${new Date().toISOString()}] Starting email queue processor...`);
    
    // Connect to database if not already connected
    await connectDB();
    
    // Process email queue
    await processEmailQueue();
    
    console.log(`✅ [${new Date().toISOString()}] Email queue processing completed\n`);
    
    // Exit process (for cron job)
    process.exit(0);
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error processing email queue:`, error);
    process.exit(1);
  }
};

// Run if executed directly (not imported)
// Check if this is the main module
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule) {
  runEmailProcessor();
}

export default runEmailProcessor;
