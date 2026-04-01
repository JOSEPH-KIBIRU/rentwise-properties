// src/components/WhatsAppButton.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { FaWhatsapp, FaPhone, FaTimes } from 'react-icons/fa';

const WhatsAppButton = ({ property, phoneNumber = '+254712345678' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Format phone number - remove ALL non-digit characters except +
  const formatWhatsAppNumber = (number) => {
    // First remove everything except digits and +
    let cleaned = number.replace(/[^\d+]/g, '');
    // If it starts with 0 (Kenyan format), replace with +254
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.substring(1);
    }
    // Remove the + for the wa.me URL (it doesn't want the +)
    return cleaned.replace('+', '');
  };

  // Generate pre-filled WhatsApp message
  const generateWhatsAppMessage = () => {
    if (!property) return "Hello, I'm interested in a property.";
    
    // Safely format price
    let priceNum = property.price;
    if (typeof priceNum === 'string') {
      priceNum = parseFloat(priceNum.replace(/,/g, ''));
    }
    
    const priceFormatted = priceNum && !isNaN(priceNum)
      ? new Intl.NumberFormat('en-KE', { 
          style: 'currency', 
          currency: 'KES', 
          maximumFractionDigits: 0 
        }).format(priceNum)
      : 'Price on request';
    
    // Use simple text without special characters that might break URL
    return `Hello, I'm interested in: ${property.title}\nLocation: ${property.location}\nPrice: ${priceFormatted}\nPlease share more details.`;
  };

  // Generate WhatsApp URL - TESTED FORMAT
  const getWhatsAppURL = () => {
    const formattedNumber = formatWhatsAppNumber(phoneNumber);
    const message = generateWhatsAppMessage();
    
    // Use encodeURIComponent for the message
    const encodedMessage = encodeURIComponent(message);
    
    // Format: https://wa.me/2547XXXXXXXX?text=...
    const url = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    
    
    
    return url;
  };

  // Handle click with explicit target
  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    const url = getWhatsAppURL();
    
    // Open in new tab/window
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Show button after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!phoneNumber) {
    console.warn('⚠️ No phone number provided to WhatsAppButton');
    return null;
  }

  return (
    <>
      {/* Floating Button Container */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Options Popup */}
        {showOptions && (
          <div className="whatsapp-options absolute bottom-16 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-64 animate-fade-in">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <span className="font-semibold text-gray-800">Contact Us</span>
              <button 
                onClick={() => setShowOptions(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            {/* WhatsApp Option - FIXED WITH EXPLICIT ONCLICK */}
            <a
              href={getWhatsAppURL()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group cursor-pointer"
            >
              <div className="bg-green-500 text-white p-2 rounded-full">
                <FaWhatsapp size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">WhatsApp</div>
                <div className="text-xs text-gray-500">Quick chat</div>
              </div>
            </a>
            
            {/* Call Fallback */}
            <a
              href={`tel:${phoneNumber.replace('+254', '0')}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group mt-2 cursor-pointer"
            >
              <div className="bg-blue-500 text-white p-2 rounded-full">
                <FaPhone size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">Call Us</div>
                <div className="text-xs text-gray-500">Mon-Fri, 8AM-6PM</div>
              </div>
            </a>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-green-300 cursor-pointer"
          aria-label="Contact us via WhatsApp"
        >
          <FaWhatsapp size={28} />
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
        </button>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 md:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium text-gray-800">Interested?</div>
            <div className="text-xs text-gray-500">Chat on WhatsApp</div>
          </div>
          <a
            href={getWhatsAppURL()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium transition-colors cursor-pointer"
          >
            <FaWhatsapp size={18} />
            <span>Chat Now</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default WhatsAppButton;