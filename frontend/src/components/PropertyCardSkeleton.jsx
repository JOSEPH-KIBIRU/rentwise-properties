const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-300"></div>
      
      <div className="p-4">
        {/* Price skeleton */}
        <div className="h-6 bg-gray-300 rounded mb-2 w-1/3"></div>
        
        {/* Title skeleton */}
        <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
        
        {/* Location skeleton */}
        <div className="h-4 bg-gray-300 rounded mb-3 w-1/2"></div>
        
        {/* Details row skeleton */}
        <div className="flex justify-between mb-3">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;