import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updateUser } from '../store/slices/authSlice';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', avatar: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const { token, user: loggedInUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, postsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/posts/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUser(userResponse.data);
        setPosts(postsResponse.data);
        setForm({
          username: userResponse.data.username || '',
          bio: userResponse.data.bio || '',
          avatar: userResponse.data.avatar || '',
        });
        setIsFollowing(
          userResponse.data.followers?.some(f => f._id === loggedInUser?._id)
        );
      } catch (error) {
        setError('Error fetching user data');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, token, loggedInUser]);

  const handleEdit = () => {
    setEditMode(true);
    setUpdateError('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      username: user.username || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
    setUpdateError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');
    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        {
          username: form.username,
          bio: form.bio,
          avatar: form.avatar,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser((prev) => ({ ...prev, ...response.data }));
      dispatch(updateUser(response.data));
      setEditMode(false);
    } catch (error) {
      setUpdateError('Error updating profile');
      console.error('Error:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/users/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Re-fetch user data to get updated followers
      const userResponse = await axios.get(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);
      setIsFollowing(
        userResponse.data.followers?.some(f => f._id === loggedInUser?._id)
      );
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setFollowLoading(false);
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

  const isOwnProfile = loggedInUser && (loggedInUser._id === id);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-secondary rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-6">
          <img
            src={form.avatar || 'https://placehold.co/150x150'}
            alt={form.username}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            {editMode ? (
              <form onSubmit={handleUpdate} className="space-y-2">
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 rounded bg-gray-700 text-text mb-2"
                  placeholder="Username"
                  required
                />
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 rounded bg-gray-700 text-text mb-2"
                  placeholder="Bio"
                  rows={2}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block mb-2"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
                  >
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                {updateError && <div className="text-red-500 text-sm mt-2">{updateError}</div>}
              </form>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-text">{user?.username}</h1>
                <p className="text-gray-400">{user?.bio}</p>
                <div className="flex space-x-4 mt-2">
                  <div>
                    <span className="font-bold text-text">{user?.followers?.length}</span>
                    <span className="text-gray-400 ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-bold text-text">{user?.following?.length}</span>
                    <span className="text-gray-400 ml-1">Following</span>
                  </div>
                </div>
                {isOwnProfile ? (
                  <button
                    onClick={handleEdit}
                    className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`mt-4 px-4 py-2 rounded text-white ${isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-primary hover:bg-primary-dark'}`}
                  >
                    {followLoading ? (isFollowing ? 'Unfollowing...' : 'Following...') : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-secondary rounded-lg p-6">
            <div className="flex items-center mb-4">
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <h3 className="text-text font-semibold">{post.author.username}</h3>
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
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-primary">
                <span className="mr-1">{post.likes.length}</span>
                Like
              </button>
              <button className="text-gray-400 hover:text-primary">
                <span className="mr-1">{post.comments.length}</span>
                Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile; 