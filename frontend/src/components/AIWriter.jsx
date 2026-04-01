import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AIWriter = ({ onContentGenerated, onExcerptGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [generatingPost, setGeneratingPost] = useState(false);

  const generateIdeas = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-ideas', { topic });
      if (data.success) {
        setIdeas(data.ideas);
        toast.success(`Generated ${data.ideas.length} ideas!`);
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error('Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };

  const generateFullPost = async () => {
    if (!selectedTitle) {
      toast.error('Please select a title or enter one');
      return;
    }
    
    setGeneratingPost(true);
    try {
      const { data } = await api.post('/ai/write-post', {
        title: selectedTitle,
        category: 'Property Development',
        keywords: topic.split(' ')
      });
      
      if (data.success) {
        if (onContentGenerated) onContentGenerated(data.content);
        if (onExcerptGenerated) onExcerptGenerated(data.excerpt);
        toast.success('Blog post generated!');
      }
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error('Failed to generate post');
    } finally {
      setGeneratingPost(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">✨ AI Writing Assistant</h3>
        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Powered by Google Gemini</span>
      </div>
      
      {/* Topic Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What topic do you want to write about?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Real estate investment in Nairobi"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generateIdeas}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Ideas'}
          </button>
        </div>
      </div>
      
      {/* Generated Ideas */}
      {ideas.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Ideas
          </label>
          <div className="space-y-2">
            {ideas.map((idea, index) => (
              <button
                key={index}
                onClick={() => setSelectedTitle(idea)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTitle === idea
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {idea}
              </button>
            ))}
          </div>
          
          <button
            onClick={generateFullPost}
            disabled={generatingPost || !selectedTitle}
            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50"
          >
            {generatingPost ? 'Writing...' : 'Write Full Post'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIWriter;