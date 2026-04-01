import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get('/articles/admin/all');
      setArticles(data.articles || []);
      
    } catch (error) {
      console.error('Error fetching articles:', error);
      
      // Handle rate limit error (429)
      if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and refresh the page.');
        toast.error('Rate limit exceeded. Waiting 5 seconds before retry...');
        
        // Auto retry after 5 seconds
        if (retryCount < 3) {
          setTimeout(() => {
            fetchArticles(retryCount + 1);
          }, 5000);
        } else {
          toast.error('Still having issues. Please refresh the page manually.');
        }
      } else {
        setError('Failed to load articles. Please refresh the page.');
        toast.error('Failed to load articles');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        toast.error('Failed to delete article');
      }
    }
  };

  const handleTogglePublish = async (article) => {
    try {
      await api.put(`/articles/${article.id}`, {
        is_published: !article.is_published
      });
      toast.success(article.is_published ? 'Article unpublished' : 'Article published');
      fetchArticles();
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        toast.error('Failed to update article status');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              <button
                onClick={() => fetchArticles()}
                className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Articles</h1>
          <p className="text-gray-600 mt-1">Create and manage blog articles</p>
        </div>
        <Link
          to="/dashboard/articles/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span> Write New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles yet</h3>
          <p className="text-gray-600 mb-4">Start by writing your first blog article.</p>
          <Link
            to="/dashboard/articles/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Write Article
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {article.cover_image && (
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          By {article.profiles?.full_name || 'Admin'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(article)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        article.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {article.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {article.views || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      to={`/dashboard/articles/${article.slug}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Articles;