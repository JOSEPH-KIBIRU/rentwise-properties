import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ArticleDetails = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // The API returns { success: true, article: {...} }
      const { data } = await api.get(`/articles/${slug}`);
      
      // The article is in data.article (singular), not data.articles
      if (data.article) {
        setArticle(data.article);
        
        // Fetch related articles in same category
        if (data.article.category) {
          try {
            const { data: relatedData } = await api.get(`/articles?category=${data.article.category}&limit=3`);
            // Filter out current article from related
            const related = relatedData.articles?.filter(a => a.id !== data.article.id) || [];
            setRelatedArticles(related);
          } catch (err) {
            console.error('Error fetching related articles:', err);
          }
        }
      } else {
        setError('Article not found');
      }
    } catch (error) {
      console.error('❌ Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The article you\'re looking for doesn\'t exist.'}</p>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

 return (
  <div className="bg-gray-50 min-h-screen">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link to="/blog" className="text-blue-600 hover:text-blue-700">
          ← Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {/* Cover Image - FIXED */}
        {article.cover_image ? (
          <div className="relative h-64 md:h-96 overflow-hidden bg-gray-100">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Image failed to load:', article.cover_image);
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/1200x630/e2e8f0/475569?text=No+Image';
              }}
            />
          </div>
        ) : (
          <div className="h-64 md:h-96 bg-linear-to-r from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">📷</div>
              <p className="text-gray-500">No cover image</p>
            </div>
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>By {article.author_name || 'RentWise Team'}</span>
              <span>{article.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="text-gray-700 leading-relaxed"
          />
        </div>
      </div>


        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {related.cover_image && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={related.cover_image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {related.excerpt || related.content?.substring(0, 100)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-12 bg-linear-to-r from-blue-600 to-blue-400 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-white/90 mb-6">
            Subscribe to our newsletter for the latest property news and investment tips.
          </p>
          <form className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;