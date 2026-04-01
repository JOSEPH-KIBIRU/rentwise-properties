import { useState, useEffect } from 'react';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop",
      title: "Luxury Homes in Karen",
      subtitle: "Experience elegance in Nairobi's finest neighborhood",
      alt: "Modern luxury home in Karen, Nairobi with manicured lawn"
    },
    {
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&h=900&fit=crop",
      title: "Prime Land in Kiambu",
      subtitle: "Invest in Kenya's fastest-growing real estate market",
      alt: "Beautiful green land with acacia trees in Kiambu, Kenya"
    },
    {
      image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1600&h=900&fit=crop",
      title: "Modern Apartments in Westlands",
      subtitle: "Contemporary living in the heart of Nairobi",
      alt: "Modern apartment building in Westlands, Nairobi with glass facade"
    },
    {
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=900&fit=crop",
      title: "Beachfront Properties in Diani",
      subtitle: "Your dream coastal home awaits",
      alt: "Luxury beachfront villa in Diani, Kenya with ocean view"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
          </div>
          
          {/* Content for each slide */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <div className="animate-fade-in-up">
                <div className="inline-block mb-4 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-white text-sm font-medium">✨ RentWise Properties</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/properties"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Explore Properties →
                  </a>
                  <a
                    href="/contact"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:block">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;