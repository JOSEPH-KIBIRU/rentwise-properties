import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  WhatsappIcon,
  WhatsappShareButton,
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';

const ShareButton = ({ property, className = "", position = "left" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/properties/${property.slug}`
    : '';

  const shareTitle = property.title;
  const shareText = `Check out this amazing property: ${property.title} in ${property.location}. Price: ${new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(property.price)}`;

  const handleInstagramShare = () => {
    copyToClipboard();
    window.open('https://www.instagram.com/', '_blank');
    toast.info('Link copied! Paste it in your Instagram post or story.');
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const dropdownPositionClass = position === 'left' 
    ? 'left-0' 
    : 'right-0';

  return (
    <div className={`relative ${className}`}>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        aria-label="Share property"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-gray-700">Share</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Share Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className={`absolute ${dropdownPositionClass} mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in`}>
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">Share this property</p>
            </div>
            
            {/* WhatsApp - Official Icon */}
            <WhatsappShareButton
              url={shareUrl}
              title={shareTitle}
              separator=" - "
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <WhatsappIcon size={28} round={true} />
              <span className="text-sm text-gray-700">WhatsApp</span>
            </WhatsappShareButton>
            
            {/* Facebook - Official Icon */}
            <FacebookShareButton
              url={shareUrl}
              quote={shareText}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FacebookIcon size={28} round={true} />
              <span className="text-sm text-gray-700">Facebook</span>
            </FacebookShareButton>
            
            {/* X (Twitter) - Official Icon */}
            <TwitterShareButton
              url={shareUrl}
              title={shareText}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <TwitterIcon size={28} round={true} />
              <span className="text-sm text-gray-700">X (Twitter)</span>
            </TwitterShareButton>
            
            {/* Instagram - Custom (no official share API) */}
            <button
              onClick={handleInstagramShare}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-7 h-7 bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <span className="text-sm text-gray-700">Instagram</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            {/* Copy Link */}
            <button
              onClick={() => {
                copyToClipboard();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                {copied ? '✅' : '🔗'}
              </div>
              <span className="text-sm text-gray-700">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ShareButton;