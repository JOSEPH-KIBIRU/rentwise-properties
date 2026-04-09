import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      title: "For Tenants",
      icon: "🏠",
      questions: [
        {
          q: "How do I schedule a property viewing?",
          a: "You can schedule a viewing by clicking on any property and using the 'Request Viewing' button, or by calling our office directly at +254 724 822 194. Our agents will arrange a convenient time within 24-48 hours."
        },
        {
          q: "What documents do I need to rent a property?",
          a: "You'll need: 1) Valid National ID/Passport, 2) Recent pay slips (3 months) or bank statements, 3) KRA PIN certificate, 4) Previous landlord reference (if any), and 5) Recent passport photo."
        },
        {
          q: "How much is the security deposit?",
          a: "Typically, the security deposit is equivalent to 1-2 months' rent, depending on the property. For furnished properties, it may be higher. The deposit is refundable at the end of your tenancy, subject to property condition."
        },
        {
          q: "Is the deposit refundable?",
          a: "Yes, the deposit is fully refundable provided there are no damages beyond normal wear and tear, all rent is paid up to date, and the property is returned in the same condition as when you moved in (as documented in the inspection report)."
        },
        {
          q: "How much notice do I need to give before moving out?",
          a: "The standard notice period is 30 days (one month) as per the tenancy agreement. This must be given in writing. Failure to provide proper notice may result in forfeiture of your deposit or additional rent charges."
        },
        {
          q: "Can I make changes to the property (painting, installing shelves)?",
          a: "Any alterations require prior written consent from the landlord. Minor changes like painting may be allowed, but you may need to restore the original color before moving out. Always get approval in writing first."
        },
        {
          q: "Who is responsible for repairs and maintenance?",
          a: "The landlord is responsible for major structural repairs, plumbing, electrical issues, and appliance repairs. Tenants are responsible for minor issues like replacing light bulbs, unclogging drains, and general cleanliness."
        },
        {
          q: "What happens if I need to break the lease early?",
          a: "Breaking the lease early may result in forfeiture of your deposit and you may be liable for rent until a new tenant is found. Some agreements include an early termination clause - check your contract or contact us to discuss options."
        }
      ]
    },
    {
      title: "For Landlords",
      icon: "👔",
      questions: [
        {
          q: "How do you screen potential tenants?",
          a: "We conduct comprehensive background checks including: credit history, employment verification, income verification, previous landlord references, and criminal background checks. This ensures you get reliable, responsible tenants."
        },
        {
          q: "What is your property management fee?",
          a: "Our standard management fee is 5-10% of monthly rent collected, depending on the property and services required. This includes tenant sourcing, rent collection, maintenance coordination, and monthly reporting."
        },
        {
          q: "How do you handle rent collection?",
          a: "We handle all rent collection through automated systems. Tenants can pay via M-Pesa, bank transfer, or card. We follow up on late payments, send reminders, and handle any disputes. You receive your rent directly on the agreed date."
        },
        {
          q: "What happens if a tenant stops paying rent?",
          a: "We have a strict rent collection policy. After 7 days late, we issue a reminder. After 14 days, we issue a formal notice. If payment isn't made, we initiate the eviction process through legal channels as permitted by Kenyan law."
        },
        {
          q: "How do you handle maintenance and repairs?",
          a: "We have a network of vetted, licensed contractors. Tenants submit requests through our portal. For emergencies, we respond within 2 hours. For routine issues, within 48 hours. All costs are pre-approved by you before work begins."
        },
        {
          q: "What kind of properties do you manage?",
          a: "We manage all types of residential properties including apartments, houses, townhouses, and villas. We also manage commercial properties like office spaces and retail units. Contact us for a free consultation."
        },
        {
          q: "How often do you inspect properties?",
          a: "We conduct quarterly inspections (every 3 months) with photo documentation. You receive a detailed report including property condition, any issues identified, and recommendations. Move-in and move-out inspections are also conducted."
        },
        {
          q: "What reports do I receive as a landlord?",
          a: "You receive monthly financial statements including rent collected, expenses, maintenance costs, and your net income. You also get quarterly property inspection reports and an annual performance summary."
        }
      ]
    },
    {
      title: "General Questions",
      icon: "📋",
      questions: [
        {
          q: "Are your properties verified?",
          a: "Yes! Every property listed on RentWise is physically verified by our team. We confirm ownership, property condition, and ensure all documentation is legitimate. We don't list properties we haven't inspected."
        },
        {
          q: "How do I report an issue with my rental?",
          a: "Logged-in tenants can submit maintenance requests through their dashboard. You can also call our 24/7 maintenance hotline at +254 724 822 194 for emergencies. We aim to respond within 2 hours for emergencies."
        },
        {
          q: "Do you offer furnished properties?",
          a: "Yes, we have both furnished and unfurnished properties. Furnished properties include essential furniture (bed, sofa, dining table, curtains) and appliances (fridge, cooker). Check individual listings for details."
        },
        {
          q: "Can I bring pets?",
          a: "Pet policies vary by property and landlord. Some properties allow pets with an additional pet deposit. Always check the property listing or ask our agents before applying. Service animals are generally allowed by law."
        },
        {
          q: "What happens after I submit an inquiry?",
          a: "Our team responds within 24 hours. For property viewings, we'll contact you to schedule a convenient time. For other inquiries, we'll provide the information you need or connect you with the right person."
        },
        {
          q: "Is my personal information secure?",
          a: "Absolutely. We use industry-standard encryption and security measures. Your data is never shared with third parties without your consent. We comply with Kenyan data protection laws."
        },
        {
          q: "Do you charge any fees to tenants?",
          a: "No, our services are free for tenants! Landlords pay our fees. You only pay rent and deposit. We never charge tenants for viewings, applications, or lease signing."
        },
        {
          q: "What areas do you serve in Kenya?",
          a: "We primarily serve Nairobi (Westlands, Karen, Kilimani, Lavington, Kileleshwa, Runda, Gigiri) and Kiambu (Thika, Ruiru, Kiambu Town, Limuru). We're expanding to Mombasa and Kisumu soon."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Find answers to common questions about renting, property management, and our services
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {faqCategories.map((category, idx) => (
            <button
              key={idx}
              onClick={() => {
                const element = document.getElementById(`category-${idx}`);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 flex items-center gap-2"
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium text-gray-700">{category.title}</span>
            </button>
          ))}
        </div>

        {/* FAQ Categories */}
        {faqCategories.map((category, catIdx) => (
          <div key={catIdx} id={`category-${catIdx}`} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">{category.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="space-y-4">
              {category.questions.map((faq, idx) => {
                const globalIndex = `${catIdx}-${idx}`;
                const isOpen = openIndex === globalIndex;

                return (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleFAQ(globalIndex)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-900">{faq.q}</span>
                      <span className={`text-blue-600 text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still Have Questions Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Still Have Questions?</h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? We're here to help!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Contact Us
            </Link>
            <a
              href="tel:+254724822194"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              Call Us: +254 724 822 194
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;