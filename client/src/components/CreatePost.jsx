import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useSelector((state) => state.auth);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/posts',
        { content, image },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setContent('');
      setImage(null);
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (error) {
      setError('Error creating post');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary rounded-lg p-6 mb-8">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-2 bg-gray-700 text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows="3"
          />
        </div>

        {image && (
          <div className="mb-4 relative">
            <img
              src={image}
              alt="Preview"
              className="max-h-48 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <label className="cursor-pointer bg-gray-700 text-text px-4 py-2 rounded-lg hover:bg-gray-600">
              <span>Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>

        {error && (
          <div className="mt-2 text-red-500 text-sm">{error}</div>
        )}
      </form>
    </div>
  );
};

export default CreatePost; 