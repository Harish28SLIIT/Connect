# Harish App

A social media platform similar to Instagram where users can share posts, follow others, interact through likes and comments, and chat with other users.

## Features

- User authentication (Google OAuth 2.0 and Email/Password)
- Create, edit, and delete posts
- Like and comment on posts
- Follow/unfollow users
- Real-time chat functionality
- User profiles
- Feed with posts from followed users

## Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: Google OAuth 2.0, JWT
- Real-time features: Socket.io

## Project Structure

```
harish-app/
├── client/             # Frontend React application
├── server/             # Backend Node.js application
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud Console account (for OAuth)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 