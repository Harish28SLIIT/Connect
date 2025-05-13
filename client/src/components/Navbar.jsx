import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import axios from 'axios';
import { io } from 'socket.io-client';

const Navbar = () => {
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket.io
      const socket = io('http://localhost:5000');
      socket.emit('join', user._id);
      socket.on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      return () => {
        socket.disconnect();
      };
    }
    // eslint-disable-next-line
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
      // Mark as read
      await axios.put('http://localhost:5000/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
    } catch (err) {
      // ignore
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationsClick = () => {
    setShowNotifications((prev) => {
      const next = !prev;
      if (!prev && isAuthenticated) {
        fetchNotifications();
      }
      return next;
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      // ignore
    }
  };

  return (
    <nav className="bg-secondary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-primary text-xl font-bold">Harish App</span>
            </Link>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative mr-4">
                  <button
                    onClick={handleNotificationsClick}
                    className="focus:outline-none"
                  >
                    <span className="text-2xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-secondary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between p-4 border-b border-gray-700 font-bold text-text">
                        <span>Notifications</span>
                        <button onClick={clearAllNotifications} className="text-xs text-red-400 hover:underline">Clear All</button>
                      </div>
                      {loadingNotifications ? (
                        <div className="p-4 text-gray-400">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-gray-400">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`p-4 border-b border-gray-700 ${!n.read ? 'bg-gray-800' : ''}`}>
                            <div className="flex items-center">
                              <img src={n.fromUser.avatar} alt={n.fromUser.username} className="w-8 h-8 rounded-full mr-3" />
                              <div className="flex-1">
                                <span className="font-semibold text-text">{n.fromUser.username}</span>
                                {n.type === 'like' ? (
                                  <span className="text-text"> liked your post.</span>
                                ) : n.type === 'comment' ? (
                                  <span className="text-text"> commented on your post.</span>
                                ) : n.type === 'follow' ? (
                                  <span className="text-text"> started following you.</span>
                                ) : null}
                                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {/* Profile menu */}
                <Menu as="div" className="relative ml-3">
                  <Menu.Button className="flex items-center">
                    <img
                      src={user?.avatar}
                      alt={user?.username}
                      className="h-8 w-8 rounded-full"
                    />
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-secondary ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={`/profile/${user._id}`}
                            className={`${
                              active ? 'bg-gray-700' : ''
                            } block px-4 py-2 text-sm text-text`}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/chat"
                            className={`${
                              active ? 'bg-gray-700' : ''
                            } block px-4 py-2 text-sm text-text`}
                          >
                            Messages
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-700' : ''
                            } block w-full text-left px-4 py-2 text-sm text-text`}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white hover:bg-primary-dark px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 