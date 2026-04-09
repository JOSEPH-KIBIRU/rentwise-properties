import { Link } from 'react-router-dom';

const Tenants = () => {
  const steps = [
    {
      number: '01',
      title: 'Search & Discover',
      description: 'Browse through our curated list of verified properties. Use our smart filters to find homes that match your budget, location, and preferences.',
      icon: '🔍'
    },
    {
      number: '02',
      title: 'View & Visit',
      description: 'Schedule viewings at your convenience. Our agents will accompany you to show you the property and answer all your questions.',
      icon: '🏠'
    },
    {
      number: '03',
      title: 'Application & Approval',
      description: 'Submit your application online. We review your documents and get landlord approval quickly - usually within 24-48 hours.',
      icon: '📝'
    },
    {
      number: '04',
      title: 'Lease Signing',
      description: 'We guide you through the lease agreement, explain all terms, and ensure you understand your rights and responsibilities.',
      icon: '✍️'
    },
    {
      number: '05',
      title: 'Move In',
      description: 'Collect your keys, do a joint inspection, and start enjoying your new home with our continued support throughout your tenancy.',
      icon: '🚚'
    }
  ];

  const benefits = [
    { title: 'No Hidden Fees', description: 'Transparent pricing with no surprise costs', icon: '💰' },
    { title: 'Verified Listings', description: 'All properties personally inspected', icon: '✅' },
    { title: 'Legal Protection', description: 'Proper lease agreements registered', icon: '⚖️' },
    { title: '24/7 Support', description: 'We\'re here when you need us', icon: '🎧' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&h=500&fit=crop"
          alt="Happy family sitting together in their living room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-5xl font-bold mb-4">Find Your Dream Home</h1>
            <p className="text-xl mb-8 max-w-2xl">We make finding and renting your perfect home effortless. From search to signing, we're with you every step of the way.</p>
            <Link to="/properties" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-block">
              Browse Properties →
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our simple 5-step process makes renting your next home easy and stress-free</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <div className="text-sm text-blue-600 font-semibold mb-2">Step {step.number}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RentWise?</h2>
            <p className="text-gray-600">We're Kenya's most trusted rental platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6 border rounded-lg hover:shadow-lg transition">
                <div className="text-4xl mb-3">{benefit.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Home?</h2>
          <p className="text-blue-100 mb-8">Start your journey with us today</p>
          <div className="flex gap-4 justify-center">
            <Link to="/properties" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Browse Properties
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenants;