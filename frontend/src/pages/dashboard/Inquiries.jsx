import { useState, useEffect } from 'react';
import api from '../../services/api';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data } = await api.get('/inquiries');
      setInquiries(data.inquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/inquiries/${id}`, { status });
      setInquiries(inquiries.map(i => 
        i.id === id ? { ...i, status } : i
      ));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inquiries</h1>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No inquiries yet</h3>
          <p className="text-gray-600">When people inquire about your properties, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <div key={inquiry.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {inquiry.name}
                  </h3>
                  <p className="text-sm text-gray-500">{inquiry.email}</p>
                  {inquiry.phone && (
                    <p className="text-sm text-gray-500">📞 {inquiry.phone}</p>
                  )}
                </div>
                <select
                  value={inquiry.status}
                  onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(inquiry.status)}`}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              {inquiry.property && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Regarding: <span className="font-medium">{inquiry.property.title}</span>
                  </p>
                  <p className="text-xs text-gray-500">{inquiry.property.location}</p>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Received: {new Date(inquiry.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inquiries;