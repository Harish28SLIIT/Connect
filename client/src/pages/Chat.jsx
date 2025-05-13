import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useSelector((state) => state.auth);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    });

    // Join user's room
    socketRef.current.emit('join', user.id);

    // Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Fetch users and messages
    const fetchData = async () => {
      try {
        const [usersResponse, messagesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          selectedUser && axios.get(`http://localhost:5000/api/messages/${selectedUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUsers(usersResponse.data);
        if (messagesResponse) {
          setMessages(messagesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      socketRef.current.disconnect();
    };
  }, [token, user.id, selectedUser]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      content: newMessage,
      senderId: user.id,
      recipientId: selectedUser.id,
    };

    socketRef.current.emit('sendMessage', messageData);
    setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* Users List */}
        <div className="bg-secondary rounded-lg p-4">
          <h2 className="text-xl font-bold text-text mb-4">Messages</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left p-3 rounded-lg ${
                  selectedUser?._id === u._id
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={u.avatar}
                    alt={u.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{u.username}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-2 bg-secondary rounded-lg flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <h3 className="text-text font-semibold">
                    {selectedUser.username}
                  </h3>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.senderId === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        message.senderId === user.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-text'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-text rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400">Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 