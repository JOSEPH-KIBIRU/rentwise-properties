import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { fetchWithRetry } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import HeroCarousel from '../components/HeroCarousel';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading featured properties...');
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
  setLoading(true);
  setLoadingMessage('Loading featured properties...');
  
  try {
    // Use the retry helper for better cold start handling
    const response = await fetchWithRetry('/properties?featured=true&limit=6', {}, 2);
    
    setFeaturedProperties(response.data.properties || []);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    setLoadingMessage(error.message || 'Unable to load properties. Please refresh the page.');
    
    // Show a manual retry button
    setTimeout(() => {
      if (loading) {
        setLoadingMessage('Still loading? Click to retry →');
      }
    }, 8000);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/properties?location=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: 'For Sale', emoji: '🏠', color: 'bg-emerald-100 text-emerald-700', hoverColor: 'hover:bg-emerald-200', description: 'Find your dream home' },
    { name: 'To Let', emoji: '🔑', color: 'bg-blue-100 text-blue-700', hoverColor: 'hover:bg-blue-200', description: 'Rent your ideal space' },
    { name: 'Land', emoji: '🌍', color: 'bg-amber-100 text-amber-700', hoverColor: 'hover:bg-amber-200', description: 'Invest in prime land' },
    { name: 'Short-term', emoji: '🏨', color: 'bg-purple-100 text-purple-700', hoverColor: 'hover:bg-purple-200', description: 'BnB & vacation stays' },
  ];

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Search Bar Below Carousel */}
      <section className="relative -mt-12 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by location... e.g., Westlands, Karen, Kiambu"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-gray-50"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Search Properties
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/properties?category=${category.name}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-90 group-hover:opacity-95 transition-opacity"></div>
                <div className="relative p-8 text-center">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {category.emoji}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                  <div className="mt-4 inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm group-hover:bg-white/30 transition-colors">
                    Browse →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-xl text-gray-600">Hand-picked properties just for you</p>
            </div>
            <Link to="/properties" className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
              View All Properties
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">{loadingMessage}</p>
              {loadingMessage.includes('Retrying') && (
                <p className="text-sm text-gray-400 mt-2">This may take up to 15 seconds on first load</p>
              )}
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-7xl mb-4">⭐</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No featured properties yet</h3>
              <p className="text-gray-600">Check back soon for our hand-picked selections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose RentWise?</h2>
            <p className="text-xl text-blue-100">Kenya's most trusted real estate platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Verified Listings</h3>
              <p className="text-blue-100">All properties are verified by our team for authenticity and quality</p>
            </div>
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Best Prices</h3>
              <p className="text-blue-100">Get the best market rates for properties across Kenya</p>
            </div>
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤝</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Expert Support</h3>
              <p className="text-blue-100">Our team of experts is here to help you every step of the way</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to find your dream property?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of happy clients who found their perfect home with RentWise</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
              Browse Properties
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;