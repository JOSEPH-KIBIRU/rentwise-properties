// src/services/keepalive.js
import api from './api';

// Simple ping using the root endpoint (lightweight)
const pingServer = async () => {
  try {
    // Use the root endpoint which is very lightweight
    const response = await api.get('/', { timeout: 10000 });
    return response.data.status === 'OK';
  } catch (error) {
    console.error('Ping failed:', error.message);
    return false;
  }
};

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
    
    // Initial ping to warm up the server
    if (shouldRun()) {
      console.log('🔥 Initial warm-up ping...');
      pingServer().then(isHealthy => {
        if (isHealthy) {
          console.log('✅ Server is warm');
        } else {
          console.log('⚠️ Server may need a moment to wake up');
        }
      });
    }
    
    // Ping every 10 minutes to keep server warm
    this.interval = setInterval(async () => {
      if (shouldRun()) {
        console.log(`🔄 Keep-alive ping at ${new Date().toLocaleTimeString()}`);
        const isHealthy = await pingServer();
        if (isHealthy) {
          console.log('✅ Server is warm');
        } else {
          console.log('⚠️ Server might be cold, pinging...');
          // Try a second ping if first failed
          setTimeout(() => pingServer(), 2000);
        }
      } else {
        console.log('💤 Outside business hours - keep-alive sleeping');
      }
    }, 10 * 60 * 1000); // Every 10 minutes
    
    this.isRunning = true;
    console.log('🚀 Keep-alive service started - pinging every 10 minutes during business hours');
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