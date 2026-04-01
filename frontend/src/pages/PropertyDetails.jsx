// src/pages/PropertyDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import WhatsAppButton from '../components/WhatsAppButton'; // ✅ WhatsApp import

const PropertyDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);


  useEffect(() => {
    fetchProperty();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/properties/slug/${slug}`);
      setProperty(data.property);
      
      // Pre-fill inquiry form if user is logged in
      if (user) {
        setInquiryForm({
          name: user.profile?.full_name || '',
          email: user.email,
          phone: user.profile?.phone || '',
          message: ''
        });
      }
    } catch (error) {
      console.error('❌ Error fetching property:', error);
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/inquiries", {
        property_id: property.id,
        ...inquiryForm,
      });
      setInquirySent(true);
      setInquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending inquiry:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatPrice = (price, category, pricePeriod) => {
    let priceNum = price;
    if (typeof price === 'string') {
      priceNum = parseFloat(price.replace(/,/g, ''));
    }
    
    const formatted = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(priceNum);
    
    if (category === 'To Let') {
      return `${formatted}/${pricePeriod === 'month' ? 'month' : 'year'}`;
    }
    return formatted;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    console.warn('⚠️ No property found for slug:', slug);
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Property not found. <Link to="/properties" className="text-blue-600 ml-2">Back to properties</Link>
      </div>
    );
  }


  const images =
    property.images?.length > 0
      ? property.images
      : ["https://placehold.co/1200x800/e2e8f0/475569?text=No+Image"];

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/properties" className="text-blue-600 hover:text-blue-700">
            ← Back to Properties
          </Link>
        </div>

        {/* Property Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {property.title}
        </h1>
        <p className="text-gray-600 mb-6">{property.location}</p>

        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {property.images && property.images.length > 0 ? (
            <>
              <div className="relative h-96 bg-gray-100">
                <img
                  src={images[selectedImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {property.images.length > 1 && (
                <div className="grid grid-cols-6 gap-2 p-4">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-20 rounded-lg overflow-hidden ${
                        selectedImage === idx ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="relative h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-gray-500">No images available</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(
                  property.price,
                  property.category,
                  property.price_period,
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Posted on {formatDate(property.created_at)}
              </p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {(property.bedrooms || property.bathrooms || property.area) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.bedrooms && (
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {property.bedrooms}
                      </div>
                      <div className="text-gray-500">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {property.bathrooms}
                      </div>
                      <div className="text-gray-500">Bathrooms</div>
                    </div>
                  )}
                  {property.area && (
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {property.area} {property.area_unit || "sqft"}
                      </div>
                      <div className="text-gray-500">Area</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features List */}
            {property.features?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Key Features
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {property.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Interested in this property?
              </h2>
              <p className="text-gray-600 mb-4">
                Fill out the form below and we'll get back to you within 24
                hours.
              </p>

              {inquirySent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-600 text-2xl mb-2">✓</div>
                  <p className="text-green-600 font-medium">
                    Message sent successfully!
                  </p>
                  <p className="text-green-500 text-sm mt-1">
                    We'll contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={inquiryForm.name}
                      onChange={handleInquiryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={inquiryForm.email}
                      onChange={handleInquiryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={inquiryForm.phone}
                      onChange={handleInquiryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      required
                      value={inquiryForm.message}
                      onChange={handleInquiryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="I'm interested in this property. Please contact me..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              )}

              {!isAuthenticated && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </Link>{" "}
                  to save this property to your favorites.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Note for Kenya Compliance */}
        <p className="mt-8 text-xs text-gray-400 text-center">
          By contacting us, you agree to receive property updates per Kenya's Data Protection Act 2019.
        </p>
      </div>

      {/* ✅ WHATSAPP FLOATING BUTTON - Added here, outside main container */}
      <WhatsAppButton 
        property={{
          title: property.title,
          price: property.price,
          location: property.location,
          slug: property.slug,
          id: property.id
        }}
        phoneNumber="+254798118515" 
      />
    </div>
  );
};

export default PropertyDetails;