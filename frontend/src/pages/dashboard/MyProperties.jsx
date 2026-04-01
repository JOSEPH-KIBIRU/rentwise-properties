import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await api.get("/properties?my=true");
      setProperties(data.properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (property) => {
    setToggling(property.id);
    try {
      await api.put(`/properties/${property.id}`, {
        is_featured: !property.is_featured,
      });
      toast.success(
        property.is_featured ? "Removed from featured" : "Added to featured",
      );
      fetchProperties(); // Refresh the list
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Failed to update featured status");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this property? This action cannot be undone.",
      )
    )
      return;

    try {
      await api.delete(`/properties/${id}`);
      toast.success("Property deleted successfully");
      fetchProperties();
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

const formatPrice = (price, category, pricePeriod) => {
  // Ensure price is a number
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Properties</h1>
          <p className="text-gray-600 mt-1">
            Manage all property listings on RentWise
          </p>
        </div>
        <Link
          to="/dashboard/add-property"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span> Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No properties yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first property listing.
          </p>
          <Link
            to="/dashboard/add-property"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Add Property
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {property.images && property.images[0] && (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {property.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        property.category === "For Sale"
                          ? "bg-green-100 text-green-700"
                          : property.category === "To Let"
                            ? "bg-blue-100 text-blue-700"
                            : property.category === "Land"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {property.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatPrice(
                      property.price,
                      property.category,
                      property.price_period,
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleFeatured(property)}
                      disabled={toggling === property.id}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        property.is_featured
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } ${toggling === property.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {toggling === property.id ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      ) : property.is_featured ? (
                        "⭐ Featured"
                      ) : (
                        "☆ Set Featured"
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {property.views || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      to={`/dashboard/properties/${property.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/properties/${property.slug}`}
                      target="_blank"
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyProperties;
