import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, refreshStats } = useDashboardStats();

  const adminMenuItems = [
    { to: '/dashboard/properties', label: 'All Properties', emoji: '🏠', description: 'View and manage all property listings' },
    { to: '/dashboard/add-property', label: 'Add Property', emoji: '➕', description: 'List a new property' },
    { to: '/dashboard/articles', label: 'Manage Articles', emoji: '📝', description: 'Create and edit blog articles' },
    { to: '/dashboard/inquiries', label: 'Inquiries', emoji: '💬', description: 'View messages from visitors' },
    { to: '/dashboard/profile', label: 'Profile', emoji: '👤', description: 'Update your information' },
  ];

  if (stats.loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.profile?.full_name || user?.email}
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              Administrator
            </span>
          </div>
          <button
            onClick={refreshStats}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.properties}
              </div>
              <div className="text-gray-600 mt-1">Total Properties</div>
            </div>
            <div className="text-4xl">🏠</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {stats.articles}
              </div>
              <div className="text-gray-600 mt-1">Published Articles</div>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {stats.inquiries}
              </div>
              <div className="text-gray-600 mt-1">New Inquiries</div>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.views.toLocaleString()}
              </div>
              <div className="text-gray-600 mt-1">Total Views</div>
            </div>
            <div className="text-4xl">👁️</div>
          </div>
        </div>
      </div>
      
      {/* Admin Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminMenuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow group"
          >
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                {item.label}
              </h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <span className="text-gray-400 group-hover:text-blue-600">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;