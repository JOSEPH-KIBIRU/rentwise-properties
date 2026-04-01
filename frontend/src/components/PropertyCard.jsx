import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const defaultImage = 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';
  const mainImage = property.images?.[0] || defaultImage;

  const formatPrice = (price, category, pricePeriod) => {
  // Ensure price is a number
  let priceNum = price;
  if (typeof price === 'string') {
    priceNum = parseFloat(price.replace(/,/g, ''));
  }
  
  if (isNaN(priceNum)) {
    return 'Price on request';
  }
  
  const formatted = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceNum);
  
  if (category === 'To Let') {
    return `${formatted}/${pricePeriod === 'month' ? 'month' : 'year'}`;
  }
  return formatted;
};

  const getCategoryColor = (category) => {
    const colors = {
      'For Sale': 'bg-green-100 text-green-700',
      'To Let': 'bg-blue-100 text-blue-700',
      'Land': 'bg-orange-100 text-orange-700',
      'Short-term': 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Link to={`/properties/${property.slug}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group block relative">
      {/* Featured Badge */}
      {property.is_featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            ⭐ Featured
          </span>
        </div>
      )}
      
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(property.category)}`}>
          {property.category}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {property.title}
        </h3>
        
        <div className="text-gray-500 text-sm mb-3">
          📍 {property.location}
        </div>
        
        <div className="text-xl font-bold text-blue-600 mb-3">
          {formatPrice(property.price, property.category, property.price_period)}
        </div>
        
        {(property.category === 'For Sale' || property.category === 'To Let') && (
          <div className="flex items-center space-x-4 text-gray-500 text-sm">
            {property.bedrooms !== null && property.bedrooms !== undefined && property.bedrooms > 0 && (
              <span>🛏️ {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined && property.bathrooms > 0 && (
              <span>🛁 {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
            )}
            {property.area && (
              <span>📐 {property.area} {property.area_unit || 'sqft'}</span>
            )}
          </div>
        )}
        
        {property.category === 'Land' && property.area && (
          <div className="text-gray-500 text-sm">
            📐 {property.area} {property.area_unit || 'acres'}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;