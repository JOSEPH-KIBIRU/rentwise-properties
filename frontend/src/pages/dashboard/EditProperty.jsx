import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const EditProperty = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'For Sale',
    type: 'House',
    price: '',
    price_period: 'month',
    location: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    area_unit: 'sqft',
    features: '',
    amenities: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [propertyId, setPropertyId] = useState(null); // Store the actual ID for updates

  const categories = ['For Sale', 'To Let', 'Land', 'Short-term'];
  const propertyTypes = ['House', 'Apartment', 'Commercial', 'Land', 'Townhouse', 'Villa'];
  const areaUnits = ['sqft', 'sqm', 'acres'];
  const pricePeriods = [
    { value: 'month', label: 'Per Month' },
    { value: 'year', label: 'Per Year' },
    { value: 'one-time', label: 'One Time' }
  ];

  useEffect(() => {
    if (slug) {
      fetchProperty();
    }
  }, [slug]);

  const formatPriceForDisplay = (price) => {
    if (!price && price !== 0) return '';
    const priceNum = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
    if (isNaN(priceNum)) return '';
    return new Intl.NumberFormat('en-KE').format(priceNum);
  };

  const fetchProperty = async () => {
    try {
      setFetching(true);
      console.log('Fetching property with slug:', slug);
      
      // Fetch by slug instead of ID
      const { data } = await api.get(`/properties/slug/${slug}`);
      console.log('Property data:', data);
      
      const property = data.property;
      
      // Store the actual property ID for updates
      setPropertyId(property.id);
      
      setFormData({
        title: property.title || '',
        description: property.description || '',
        category: property.category || 'For Sale',
        type: property.type || 'House',
        price: formatPriceForDisplay(property.price),
        price_period: property.price_period || 'month',
        location: property.location || '',
        address: property.address || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area: property.area || '',
        area_unit: property.area_unit || 'sqft',
        features: property.features ? property.features.join(', ') : '',
        amenities: property.amenities ? property.amenities.join(', ') : ''
      });
      
      setExistingImages(property.images || []);
    } catch (error) {
      console.error('Error fetching property:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to load property');
      navigate('/dashboard/properties');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      const digits = value.replace(/\D/g, '');
      if (digits === '') {
        setFormData(prev => ({ ...prev, [name]: '' }));
      } else {
        const formatted = new Intl.NumberFormat('en-KE').format(parseInt(digits, 10));
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + existingImages.length + selectedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Some images exceed 10MB limit');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    const invalidTypes = files.filter(file => !validTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      toast.error('Only JPEG, PNG, WebP, and HEIC images are allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeExistingImage = (index) => {
    const removed = existingImages[index];
    setRemovedImages(prev => [...prev, removed]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get raw price without commas
    const rawPrice = formData.price.replace(/,/g, '');
    const priceNumber = parseFloat(rawPrice);
    
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!propertyId) {
      toast.error('Property ID not found');
      return;
    }

    setLoading(true);

    try {
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        price: priceNumber,
        price_period: formData.price_period,
        location: formData.location,
        address: formData.address,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        area_unit: formData.area_unit,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : []
      };
      
      console.log('Updating property with ID:', propertyId);
      console.log('Update data:', updateData);
      
      const response = await api.put(`/properties/${propertyId}`, updateData);
      
      if (response.data.success) {
        toast.success('Property updated successfully! 🎉');
        setTimeout(() => {
          navigate('/dashboard/properties');
        }, 1500);
      } else {
        toast.error('Update failed. Please try again.');
      }
      
    } catch (err) {
      console.error('Error updating property:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 404) {
        toast.error('Property not found. It may have been deleted.');
        navigate('/dashboard/properties');
      } else {
        toast.error(err.response?.data?.error || 'Failed to update property. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Loading property...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-600 mt-1">Update property details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rest of your form JSX remains exactly the same */}
        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Images</h2>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Images Preview */}
          {imagePreviews.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Images</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
            multiple
            onChange={handleImageSelect}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Add more images (max 10 total)</p>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (KES) *
                </label>
                <input
                  type="text"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 75,000"
                />
                <p className="text-xs text-gray-500 mt-1">Enter price with or without commas</p>
              </div>

              {formData.category === 'To Let' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Period
                  </label>
                  <select
                    name="price_period"
                    value={formData.price_period}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pricePeriods.map(period => (
                      <option key={period.value} value={period.value}>{period.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Area/City) *
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        {formData.category !== 'Land' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  step="1"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="bathrooms"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="area"
                    min="0"
                    value={formData.area}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="area_unit"
                    value={formData.area_unit}
                    onChange={handleChange}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {areaUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {formData.category === 'Land' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Land Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Land Size
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="area"
                  min="0"
                  value={formData.area}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="area_unit"
                  value={formData.area_unit}
                  onChange={handleChange}
                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="acres">Acres</option>
                  <option value="sqft">Sq Ft</option>
                  <option value="sqm">Sq M</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Features & Amenities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features & Amenities</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (comma separated)
              </label>
              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Parking, Swimming Pool, Gym, Security"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities (comma separated)
              </label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Water, Electricity, Internet, Cable TV"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Property'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/properties')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;