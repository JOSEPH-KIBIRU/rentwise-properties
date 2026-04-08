import api, { checkServerHealth } from './api';

// This helps keep the server warm during business hours
class KeepAliveService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }
  
  start() {
    if (this.isRunning) return;
    
    // Only run during Kenyan business hours (6 AM - 10 PM EAT)
    const shouldRun = () => {
      const now = new Date();
      const eatHour = (now.getUTCHours() + 3) % 24; // Convert UTC to EAT
      return eatHour >= 6 && eatHour < 22;
    };
    
    // Ping every 10 minutes to keep server warm
    this.interval = setInterval(async () => {
      if (shouldRun()) {
        console.log('🔄 Keep-alive ping...');
        const isHealthy = await checkServerHealth();
        if (isHealthy) {
          console.log('✅ Server is warm');
        } else {
          console.log('⚠️ Server might be cold');
        }
      }
    }, 10 * 60 * 1000); // Every 10 minutes
    
    this.isRunning = true;
    console.log('🚀 Keep-alive service started');
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.isRunning = false;
      console.log('🛑 Keep-alive service stopped');
    }
  }
}

export const keepAlive = new KeepAliveService();