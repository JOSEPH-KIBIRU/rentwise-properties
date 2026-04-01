import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    properties: 0,
    articles: 0,
    inquiries: 0,
    views: 0,
    loading: true
  });

  const fetchAllStats = useCallback(async () => {
    try {
      
      // Fetch properties
      const propertiesRes = await api.get('/properties');
      const propertiesCount = propertiesRes.data.pagination?.total || propertiesRes.data.properties?.length || 0;
      
      // Fetch articles
      const articlesRes = await api.get('/articles');
      const articlesCount = articlesRes.data.pagination?.total || articlesRes.data.articles?.length || 0;
      
      // Fetch inquiries
      let inquiriesCount = 0;
      try {
        const inquiriesRes = await api.get('/inquiries');
        inquiriesCount = inquiriesRes.data.pagination?.total || inquiriesRes.data.inquiries?.length || 0;
      } catch (e) {
      }
      
      // Calculate views
      let totalViews = 0;
      if (propertiesRes.data.properties) {
        totalViews = propertiesRes.data.properties.reduce((sum, p) => sum + (p.views || 0), 0);
      }
      
      setStats({
        properties: propertiesCount,
        articles: articlesCount,
        inquiries: inquiriesCount,
        views: totalViews,
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchAllStats, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllStats]);

  return { stats, refreshStats: fetchAllStats };
};