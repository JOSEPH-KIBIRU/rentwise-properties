import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const categories = ['For Sale', 'To Let', 'Land', 'Short-term'];
  const propertyTypes = ['House', 'Apartment', 'Commercial', 'Land', 'Townhouse', 'Villa'];
  const areaUnits = ['sqft', 'sqm', 'acres'];
  const pricePeriods = [
    { value: 'month', label: 'Per Month' },
    { value: 'year', label: 'Per Year' },
    { value: 'one-time', label: 'One Time' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Store raw digits only
      const digits = value.replace(/\D/g, '');
      if (digits === '') {
        setFormData(prev => ({ ...prev, [name]: '' }));
      } else {
        setFormData(prev => ({ ...prev, [name]: digits }));
      }
      return;
    }
    
    if (name === 'bedrooms' || name === 'bathrooms' || name === 'area') {
      if (value === '') {
        setFormData(prev => ({ ...prev, [name]: '' }));
        return;
      }
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue < 0) return;
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedImages.length > 10) {
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

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const priceNumber = parseFloat(formData.price);
    
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setUploading(true);
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'price' && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append price as number
      submitData.append('price', priceNumber);
      
      // Append images
      selectedImages.forEach(image => {
        submitData.append('images', image);
      });

      await api.post('/properties', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Property added successfully! 🎉');
      
      setTimeout(() => {
        navigate('/dashboard/properties');
      }, 1500);
      
    } catch (err) {
      console.error('Error adding property:', err);
      toast.error(err.response?.data?.error || 'Failed to add property. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleKeyDown = (e, field) => {
    if (field === 'bedrooms' || field === 'bathrooms' || field === 'area' || field === 'price') {
      if (e.key === '-' || e.key === 'e') {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-1">Fill in the details to list your property</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Images</h2>
          
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
            multiple
            onChange={handleImageSelect}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Upload up to 10 images. First image will be the cover photo.</p>
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
                placeholder="e.g., Modern 3 Bedroom Apartment in Westlands"
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
                placeholder="Describe the property, its features, and unique selling points..."
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
                  value={formData.price ? new Intl.NumberFormat('en-KE').format(parseInt(formData.price)) : ''}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'price')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 75,000"
                />
                <p className="text-xs text-gray-500 mt-1">Enter price in KES (numbers only)</p>
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
                placeholder="e.g., Westlands, Nairobi"
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
                placeholder="e.g., Kenyatta Avenue, Westlands"
              />
            </div>
          </div>
        </div>

        {/* Property Details - For Houses/Apartments */}
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
                  onKeyDown={(e) => handleKeyDown(e, 'bedrooms')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 0 for studio apartments</p>
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
                  onKeyDown={(e) => handleKeyDown(e, 'bathrooms')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
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
                    onKeyDown={(e) => handleKeyDown(e, 'area')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1200"
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

        {/* Land Details */}
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
                  onKeyDown={(e) => handleKeyDown(e, 'area')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0.5"
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
              <p className="text-xs text-gray-500 mt-1">Separate features with commas</p>
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
              <p className="text-xs text-gray-500 mt-1">Separate amenities with commas</p>
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
            {uploading ? 'Uploading Images...' : loading ? 'Adding Property...' : 'Add Property'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;