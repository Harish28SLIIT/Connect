import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import CreatePost from '../components/CreatePost';
import { Link } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const { token, user } = useSelector((state) => state.auth);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.posts);
    } catch (error) {
      setError('Error fetching posts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? response.data : post))
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentInput = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? response.data : post))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CreatePost onPostCreated={handlePostCreated} />
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-secondary rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Link to={`/profile/${post.author._id}`} className="flex items-center mr-4 group">
                <img
                  src={post.author.avatar}
                  alt={post.author.username}
                  className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-primary transition"
                />
              </Link>
              <div>
                <Link to={`/profile/${post.author._id}`} className="text-text font-semibold hover:underline">
                  {post.author.username}
                </Link>
                <p className="text-gray-400 text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-text mb-4">{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="rounded-lg mb-4 max-h-96 w-full object-cover"
              />
            )}
            <div className="flex items-center space-x-4 mb-2">
              <button
                className={`text-gray-400 hover:text-primary flex items-center ${post.likes.includes(user?._id) ? 'text-primary' : ''}`}
                onClick={() => handleLike(post._id)}
              >
                <span className="mr-1">{post.likes.length}</span>
                <span className="text-lg">
                  {post.likes.includes(user?._id) ? '❤️' : '🤍'}
                </span>
              </button>
              <button
                className="text-gray-400 hover:text-primary"
                onClick={() => handleCommentInput(post._id, commentInputs[post._id] ? '' : ' ')}
              >
                <span className="mr-1">{post.comments.length}</span>
                Comment
              </button>
            </div>
            {/* Comment input */}
            {typeof commentInputs[post._id] !== 'undefined' && (
              <div className="mb-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => handleCommentInput(post._id, e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-1 rounded bg-gray-700 text-text"
                />
                <button
                  onClick={() => handleAddComment(post._id)}
                  className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark"
                >
                  Post
                </button>
              </div>
            )}
            {/* Show comments */}
            <div className="mt-2 space-y-1">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="text-sm text-gray-300 flex items-center">
                  <Link to={`/profile/${comment.author._id}`} className="flex items-center mr-2 group">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.username}
                      className="w-6 h-6 rounded-full border-2 border-transparent group-hover:border-primary transition"
                    />
                  </Link>
                  <Link to={`/profile/${comment.author._id}`} className="font-semibold mr-1 hover:underline text-text">
                    {comment.author.username}
                  </Link>
                  <span>{comment.content}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 