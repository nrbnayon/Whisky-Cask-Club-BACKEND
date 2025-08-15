# Reusable Backend Template using express js

A comprehensive, production-ready backend API built with Node.js, Express.js, MongoDB, Redis, and Socket.IO. This backend provides authentication, user management, real-time messaging, notifications, activity tracking, subscription management, and more.

## 🚀 Features

### Core Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **User Management** - Complete user CRUD operations with profile management
- **Real-time Messaging** - Socket.IO powered chat system
- **Push Notifications** - Firebase Cloud Messaging integration
- **Activity Tracking** - Comprehensive user activity logging
- **Online Status Tracking** - Real-time user presence system
- **Subscription Management** - Stripe integration for payments
- **File Upload** - Multi-format file upload with validation
- **Blog System** - Content management system
- **Email System** - Transactional emails with templates

### Advanced Features

- **Redis Caching** - High-performance caching layer
- **Rate Limiting** - API protection with Nginx
- **Real-time Updates** - WebSocket connections for live data
- **Comprehensive Logging** - Winston-based logging system
- **Data Validation** - Zod schema validation
- **Error Handling** - Centralized error management
- **Health Checks** - Application monitoring endpoints
- **Docker Support** - Complete containerization
- **Database Indexing** - Optimized MongoDB queries

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: Nodemailer
- **Payments**: Stripe
- **Push Notifications**: Firebase Admin SDK
- **Logging**: Winston
- **Process Manager**: PM2 (production)
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx

## 📋 Prerequisites

- Node.js 20+ and npm/pnpm
- MongoDB 7.0+
- Redis 7.0+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend-template-db
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - API: http://localhost:5000
   - MongoDB: localhost:27017
   - Redis: localhost:6379

### Manual Installation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start MongoDB and Redis**

   ```bash
   # MongoDB
   mongod --dbpath /path/to/data

   # Redis
   redis-server
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start development server**
   ```bash
   pnpm run dev
   ```

## 📁 Project Structure

```
src/
├── app/
│   ├── errors/              # Error handling
│   ├── middlewares/         # Express middlewares
│   └── modules/             # Feature modules
│       ├── auth/            # Authentication
│       ├── user/            # User management
│       ├── blog/            # Blog system
│       ├── message/         # Messaging
│       ├── notification/    # Notifications
│       ├── activityLog/     # Activity tracking
│       ├── onlineStatus/    # Online presence
│       └── subscription/    # Payment subscriptions
├── config/                  # Configuration files
├── helpers/                 # Utility functions
├── jobs/                    # Cron jobs
├── shared/                  # Shared utilities
├── socket/                  # Socket.IO handlers
├── types/                   # TypeScript types
└── routes/                  # Route definitions
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server
NODE_ENV=development
PORT=5000
IP_ADDRESS=localhost

# Database
DATABASE_URL=mongodb://localhost:27017/backend-template-db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Upload
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/sign-in` - User login
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/refresh-token` - Refresh access token

### User Management

- `POST /api/v1/user/sign-up` - User registration
- `GET /api/v1/user/me` - Get current user
- `PATCH /api/v1/user/profile-update` - Update profile
- `GET /api/v1/user/all` - Get all users (Admin)
- `DELETE /api/v1/user/account` - Delete account

### Real-time Features

- `GET /api/v1/online-status/online-users` - Get online users
- `POST /api/v1/online-status/heartbeat` - Update user activity
- `GET /api/v1/notifications/my-notifications` - Get notifications
- `POST /api/v1/notifications/device-token/register` - Register push token

### Activity Tracking

- `GET /api/v1/activity-logs/my-activities` - Get user activities
- `GET /api/v1/activity-logs/all` - Get all activities (Admin)
- `GET /api/v1/activity-logs/stats` - Activity statistics

### Messaging

- `GET /api/v1/messages/messages` - Get messages
- `POST /api/v1/messages/message-with-image` - Send message with image

### Blog System

- `POST /api/v1/blog/create-blog` - Create blog post (Admin)
- `GET /api/v1/blog/all-blogs` - Get all blog posts
- `GET /api/v1/blog/blog-details/:id` - Get blog post
- `PATCH /api/v1/blog/update-blog/:id` - Update blog post (Admin)
- `DELETE /api/v1/blog/delete-blog/:id` - Delete blog post (Admin)

### Subscriptions

- `GET /api/v1/subscriptions/plans` - Get subscription plans
- `POST /api/v1/subscriptions/create` - Create subscription
- `GET /api/v1/subscriptions/status` - Get subscription status
- `POST /api/v1/subscriptions/cancel` - Cancel subscription

## 🔄 Real-time Events

### Socket.IO Events

**Client to Server:**

- `register` - Register user for real-time updates
- `sendMessage` - Send a message
- `activeChat` - Set active chat session
- `markAsRead` - Mark messages as read
- `typing` - User typing indicator
- `heartbeat` - Keep user online

**Server to Client:**

- `receiver-{userId}` - Receive new message
- `message-sent` - Message delivery confirmation
- `user:online` - User came online
- `user:offline` - User went offline
- `notification:{userId}` - New notification
- `onlineUsers` - Updated online users list

## 📊 Monitoring & Logging

### Health Checks

- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Logging

- **Development**: Console output with colors
- **Production**: File-based logging with rotation
- **Levels**: Error, Warn, Info, Debug
- **Storage**: `logs/` directory with daily rotation

### Activity Tracking

All user actions are automatically logged including:

- Authentication events
- Profile updates
- Content creation/modification
- File uploads
- Admin actions

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** via Nginx
- **Input Validation** with Zod schemas
- **SQL Injection Protection** via Mongoose
- **XSS Protection** with helmet middleware
- **CORS Configuration** for cross-origin requests
- **File Upload Validation** with type/size limits
- **Password Hashing** with bcrypt
- **Role-based Access Control**

## 🚀 Deployment

### Docker Deployment

1. **Production Build**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Environment Configuration**
   ```bash
   # Update .env for production
   NODE_ENV=production
   DATABASE_URL=mongodb://your-production-db
   REDIS_URL=redis://your-production-redis
   ```

### Manual Deployment

1. **Build Application**

   ```bash
   pnpm run build
   ```

2. **Start Production Server**

   ```bash
   pnpm start
   ```

3. **Process Management (PM2)**
   ```bash
   pm2 start ecosystem.config.js
   ```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## 📈 Performance Optimization

- **Redis Caching** for frequently accessed data
- **Database Indexing** for optimized queries
- **Connection Pooling** for database connections
- **Gzip Compression** via Nginx
- **Static File Caching** with proper headers
- **Query Optimization** with aggregation pipelines
- **Memory Management** with proper cleanup jobs

## 🔧 Maintenance

### Cleanup Jobs

Automated cleanup jobs run periodically:

- **Activity Logs**: Cleaned every day (90-day retention)
- **Notifications**: Expired notifications removed daily
- **Offline Users**: Updated every 5 minutes
- **File Cleanup**: Unused files removed weekly

### Database Maintenance

```bash
# MongoDB maintenance
db.runCommand({compact: "collection_name"})

# Redis maintenance
redis-cli FLUSHDB
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the logs for debugging

## 🔄 Changelog

### v1.0.0

- Initial release with core features
- Authentication and user management
- Real-time messaging and notifications
- Activity tracking and online status
- Subscription management
- Docker support
- Comprehensive API documentation
