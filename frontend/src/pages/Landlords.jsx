import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Landlords = () => {
  const [showInquiry, setShowInquiry] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_address: '',
    property_type: 'residential',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const services = [
    {
      title: 'Tenant Sourcing & Screening',
      description: 'We find qualified tenants and conduct thorough background checks including credit history, employment verification, and previous landlord references.',
      icon: '👥'
    },
    {
      title: 'Rent Collection',
      description: 'Timely rent collection with automated reminders. We handle late payments, follow-ups, and ensure consistent cash flow.',
      icon: '💰'
    },
    {
      title: 'Property Maintenance',
      description: '24/7 maintenance coordination with our network of vetted contractors. We handle everything from emergency repairs to routine upkeep.',
      icon: '🔧'
    },
    {
      title: 'Legal Compliance',
      description: 'We ensure your property meets all regulations, handle lease agreements, and manage tenant disputes in compliance with Kenyan law.',
      icon: '⚖️'
    },
    {
      title: 'Regular Inspections',
      description: 'Quarterly property inspections with detailed reports and photos sent directly to you.',
      icon: '📋'
    },
    {
      title: 'Financial Reporting',
      description: 'Monthly statements with income, expenses, and property performance analytics accessible via your dashboard.',
      icon: '📊'
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Create a detailed message for the inquiry
      const detailedMessage = `🏢 PROPERTY MANAGEMENT INQUIRY\n\n` +
        `Property Address: ${formData.property_address}\n` +
        `Property Type: ${formData.property_type === 'residential' ? 'Residential' : 'Commercial'}\n\n` +
        `Message: ${formData.message}\n\n` +
        `--- This is a property management inquiry from a landlord ---`;
      
      await api.post('/inquiries', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: detailedMessage,
        property_id: null
      });
      
      toast.success('Thank you! Our property management team will contact you within 24 hours.');
      setShowInquiry(false);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        property_address: '', 
        property_type: 'residential',
        message: '' 
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Frustrated Landlord Image */}
      <div className="relative h-[500px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=500&fit=crop"
          alt="Frustrated landlord struggling with rent collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-5xl font-bold mb-4">Stop Worrying About Your Property</h1>
            <p className="text-xl mb-8 max-w-2xl">Let us handle tenant management, rent collection, and maintenance while you enjoy passive income.</p>
            <button 
              onClick={() => setShowInquiry(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-block"
            >
              Would you like us to manage your property? →
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive property management services tailored to your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.title} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop"
                alt="Property management team"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Landlords Trust Us</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>98% tenant occupancy rate across our managed properties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Zero rent default with our guaranteed rent program</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>24/7 emergency maintenance hotline</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Monthly property performance reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Legal protection and eviction management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Stop Worrying?</h2>
          <p className="text-blue-100 mb-8">Join hundreds of landlords who sleep peacefully knowing their property is in good hands</p>
          <button 
            onClick={() => setShowInquiry(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Get a Free Consultation →
          </button>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Property Management Inquiry</h3>
              <button onClick={() => setShowInquiry(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Address *</label>
                <input 
                  type="text" 
                  name="property_address" 
                  required 
                  value={formData.property_address} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., Westlands, Nairobi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select 
                  name="property_type" 
                  value={formData.property_type} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                <textarea 
                  name="message" 
                  rows="3" 
                  value={formData.message} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Tell us about your property and any specific concerns..."
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landlords;