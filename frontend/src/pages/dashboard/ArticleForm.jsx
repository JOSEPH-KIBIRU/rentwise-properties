// src/pages/ArticleForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import api from "../../services/api";
import AIWriter from "../../components/AIWriter";

const ArticleForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [articleId, setArticleId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Property Development",
    is_published: false,
  });

  // ✅ Image upload state
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingCover, setExistingCover] = useState("");
  const [imageError, setImageError] = useState("");

  const categories = [
    "Property Development",
    "Market Trends",
    "Investment Tips",
    "News",
  ];

  useEffect(() => {
    if (slug && slug !== "new") {
      setIsEditMode(true);
      fetchArticleBySlug();
    } else {
      setIsEditMode(false);
    }
  }, [slug]);

  const fetchArticleBySlug = async () => {
    setFetching(true);
    try {
      const { data } = await api.get(`/articles/${slug}`);

      setFormData({
        title: data.article.title,
        excerpt: data.article.excerpt || "",
        content: data.article.content,
        category: data.article.category,
        is_published: data.article.is_published,
      });
      setArticleId(data.article.id);
      
      // ✅ Load existing cover image
      if (data.article.cover_image) {
        setExistingCover(data.article.cover_image);
        setImagePreview(data.article.cover_image);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Failed to load article");
      navigate("/dashboard/articles");
    } finally {
      setFetching(false);
    }
  };

  // ✅ Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError("Only JPG, PNG, or WebP images are allowed");
      toast.error("Invalid image format");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be less than 5MB");
      toast.error("Image too large. Max 5MB allowed");
      return;
    }

    setImageError("");
    setCoverImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Remove selected image
  const removeImage = () => {
    setCoverImage(null);
    setImagePreview("");
    setImageError("");
    // If in edit mode and removing existing image, mark for deletion
    if (isEditMode && existingCover) {
      setExistingCover("");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.title.trim()) {
    toast.error("Please enter a title");
    return;
  }
  if (!formData.content.trim()) {
    toast.error("Please enter content");
    return;
  }

  setLoading(true);
  setUploading(!!coverImage);

  try {
    const submitData = new FormData();
    
    // Append text fields
    submitData.append("title", formData.title.trim());
    submitData.append("content", formData.content.trim());
    submitData.append("category", formData.category);
    submitData.append("is_published", formData.is_published.toString());
    
    if (formData.excerpt) {
      submitData.append("excerpt", formData.excerpt.trim());
    }

    // DEBUG: Log image info
    if (coverImage) {
      submitData.append("image", coverImage);
    } else {
    }

    let response;
    if (isEditMode && articleId) {
      response = await api.put(`/articles/${articleId}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Article updated successfully!");
    } else {
      response = await api.post("/articles", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Article created successfully!");
    }

    navigate("/dashboard/articles");
  } catch (error) {
    console.error("❌ Error saving article:", error);
    console.error("❌ Error response:", error.response?.data);
    
    if (error.response?.data?.error?.includes("image")) {
      toast.error("Image upload failed: " + error.response.data.error);
    } else {
      toast.error(error.response?.data?.error || "Failed to save article");
    }
  } finally {
    setLoading(false);
    setUploading(false);
  }
};

  // ✅ Loading state
  if (fetching) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Article" : "Write New Article"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? "Update your article"
            : "Share insights about property development in Kenya"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ Cover Image Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cover Image
          </h2>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 relative">
              <img
                src={imagePreview}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Remove image"
                disabled={uploading}
              >
                <FaTimes size={14} />
              </button>
            </div>
          )}
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="cover_image"
              name="cover_image"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
              disabled={uploading}
            />
            
            <label
              htmlFor="cover_image"
              className={`cursor-pointer flex flex-col items-center ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin text-blue-500 mb-2" size={32} />
                  <span className="text-gray-600">Uploading...</span>
                </>
              ) : (
                <>
                  <FaImage className="text-gray-400 mb-2" size={32} />
                  <span className="text-blue-600 font-medium">
                    {imagePreview ? "Change Cover Image" : "Upload Cover Image"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Click to browse or drag & drop
                  </span>
                </>
              )}
            </label>
          </div>
          
          {/* Guidelines */}
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <p>• Recommended size: 1200x630px (16:9 ratio)</p>
            <p>• Max file size: 5MB</p>
            <p>• Formats: JPG, PNG, WebP</p>
            {imageError && (
              <p className="text-red-500 font-medium mt-2">{imageError}</p>
            )}
          </div>
        </div>

        {/* Article Content Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter article title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt (Short summary)
              </label>
              <textarea
                name="excerpt"
                rows="3"
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A brief summary of the article (shown in blog listing)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to auto-generate from content
              </p>
            </div>
            
            <AIWriter
              onContentGenerated={(content) => {
                setFormData((prev) => ({ ...prev, content }));
              }}
              onExcerptGenerated={(excerpt) => {
                setFormData((prev) => ({ ...prev, excerpt }));
              }}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                name="content"
                required
                rows="12"
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Write your article content here..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                id="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_published"
                className="ml-2 text-sm text-gray-700"
              >
                Publish immediately
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(loading || uploading) && (
              <FaSpinner className="animate-spin" size={16} />
            )}
            {loading
              ? "Saving..."
              : uploading
                ? "Uploading Image..."
                : isEditMode
                  ? "Update Article"
                  : "Publish Article"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/articles")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading || uploading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;