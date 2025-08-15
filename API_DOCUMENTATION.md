# Whisky Cask Club Backend API Documentation

## Overview
This is a comprehensive backend API built with Node.js, Express.js, MongoDB, Redis, and Socket.IO. It provides authentication, user management, real-time messaging, notifications, activity tracking, subscription handling, and various utility endpoints.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Most endpoints require authentication using Bearer tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}, // Response data
  "meta": {   // Pagination info (when applicable)
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errorSources": [
    {
      "path": "field_name",
      "message": "Specific error message"
    }
  ],
  "stack": "Error stack trace (development only)"
}
```

---

# Authentication Endpoints

## 1. User Registration
**POST** `/user/sign-up`

Register a new user account.

### Request Body
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "phoneCountryCode": "+1"
}
```

### Response
```json
{
  "success": true,
  "message": "Please check your email to verify your account."
}
```

---

## 2. Email Verification
**POST** `/auth/verify-email`

Verify user email with OTP code.

### Request Body
```json
{
  "email": "john@example.com",
  "oneTimeCode": 123456
}
```

### Response
```json
{
  "success": true,
  "message": "Your email has been successfully verified.",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "verified": true
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

## 3. User Login
**POST** `/auth/sign-in`

Authenticate user and get access tokens.

### Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response
```json
{
  "success": true,
  "message": "User login successfully",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "verified": true,
      "isSubscribed": false,
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

## 4. Refresh Token
**POST** `/auth/refresh-token`

Get new access token using refresh token.

### Request Body
```json
{
  "token": "refresh_token_here"
}
```

### Response
```json
{
  "success": true,
  "message": "Generate Access Token successfully",
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

---

## 5. Forgot Password
**POST** `/auth/forgot-password`

Request password reset OTP.

### Request Body
```json
{
  "email": "john@example.com"
}
```

### Response
```json
{
  "success": true,
  "message": "Please check your email, we send a OTP!"
}
```

---

## 6. Reset Password
**POST** `/auth/reset-password`

Reset password using OTP.

### Headers
```
Authorization: Bearer <reset_token>
```

### Request Body
```json
{
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Response
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 7. Change Password
**POST** `/auth/change-password`

Change password for authenticated user.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Response
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 8. Resend OTP
**POST** `/auth/resend-otp`

Resend verification OTP to email.

### Request Body
```json
{
  "email": "john@example.com"
}
```

### Response
```json
{
  "success": true,
  "message": "Generate OTP and send successfully"
}
```

---

# User Management Endpoints

## 1. Get Current User Profile
**GET** `/user/me`

Get authenticated user's profile information.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "image": "/images/profile.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "phoneNumber": "+1234567890",
    "phoneCountryCode": "+1",
    "verified": true,
    "isSubscribed": false,
    "isOnline": true,
    "lastSeen": "2024-01-01T00:00:00.000Z",
    "deviceTokens": [
      {
        "token": "device_token",
        "platform": "web",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 2. Update User Profile
**PATCH** `/user/profile-update`

Update user profile information.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
data: {
  "fullName": "John Updated",
  "phoneNumber": "+1234567891",
  "phoneCountryCode": "+1"
}
```

### Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_id",
    "fullName": "John Updated",
    "email": "john@example.com",
    "phoneNumber": "+1234567891",
    "phoneCountryCode": "+1"
  }
}
```

---

## 3. Update Profile Image
**PATCH** `/user/profile-image`

Update user profile image.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
image: <image_file>
```

### Response
```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "id": "user_id",
    "image": "/images/new-profile-image.jpg"
  }
}
```

---

## 4. Search Users by Phone
**GET** `/user/search?searchTerm=123456`

Search users by phone number or name.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `searchTerm` (string): Search term for phone number or name

### Response
```json
{
  "success": true,
  "message": "Users found by search",
  "data": [
    {
      "id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "image": "/images/profile.jpg"
    }
  ]
}
```

---

## 5. Delete User Account
**DELETE** `/user/account`

Delete current user's account.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

# Admin User Management

## 1. Get All Users (Admin)
**GET** `/user/all`

Get all users with pagination and filtering.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Query Parameters
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role (USER, ADMIN, SUPER_ADMIN)
- `status` (string): Filter by status (ACTIVE, INACTIVE, etc.)
- `verified` (boolean): Filter by verification status
- `isSubscribed` (boolean): Filter by subscription status
- `search` (string): Search in name, email, or phone

### Response
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "result": [
      {
        "id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "status": "ACTIVE",
        "verified": true,
        "isSubscribed": false,
        "isOnline": false,
        "lastSeen": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalData": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

# Real-time Features

## 1. Online Status Management

### Get Online Users
**GET** `/online-status/online-users`

Get list of currently online users.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Online users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "image": "/images/profile.jpg",
        "isOnline": true,
        "lastSeen": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 5
  }
}
```

### Get Online Users Count
**GET** `/online-status/online-count`

Get count of online users.

### Response
```json
{
  "success": true,
  "message": "Online users count retrieved successfully",
  "data": {
    "count": 25
  }
}
```

### Check User Online Status
**GET** `/online-status/user/:userId/status`

Check if specific user is online.

### Response
```json
{
  "success": true,
  "message": "User online status retrieved successfully",
  "data": {
    "userId": "user_id",
    "isOnline": true,
    "lastSeen": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update User Activity (Heartbeat)
**POST** `/online-status/heartbeat`

Update user's last activity timestamp.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "User activity updated successfully"
}
```

---

## 2. Notifications System

### Get User Notifications
**GET** `/notifications/my-notifications`

Get user's notifications with pagination.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): Filter by type (INFO, SUCCESS, WARNING, ERROR, etc.)
- `isRead` (boolean): Filter by read status
- `priority` (string): Filter by priority (LOW, MEDIUM, HIGH, URGENT)

### Response
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "title": "Welcome!",
        "message": "Welcome to our platform",
        "type": "INFO",
        "priority": "MEDIUM",
        "isRead": false,
        "data": {},
        "actionUrl": "/dashboard",
        "imageUrl": "/images/welcome.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "sender": {
          "fullName": "System",
          "email": "system@app.com"
        }
      }
    ],
    "total": 50,
    "unreadCount": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Mark Notification as Read
**PATCH** `/notifications/:id/read`

Mark specific notification as read.

### Response
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notification_id",
    "isRead": true,
    "readAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Mark All Notifications as Read
**PATCH** `/notifications/mark-all-read`

Mark all user notifications as read.

### Response
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": {
    "count": 5
  }
}
```

### Register Device Token
**POST** `/notifications/device-token/register`

Register device token for push notifications.

### Request Body
```json
{
  "token": "firebase_device_token",
  "platform": "web"
}
```

### Response
```json
{
  "success": true,
  "message": "Device token registered successfully"
}
```

### Send Bulk Notifications (Admin)
**POST** `/notifications/bulk-send`

Send notifications to multiple users.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Request Body
```json
{
  "userIds": ["user1", "user2", "user3"],
  "title": "System Maintenance",
  "message": "System will be down for maintenance",
  "type": "WARNING",
  "priority": "HIGH",
  "sendPush": true,
  "data": {
    "maintenanceTime": "2024-01-01T02:00:00.000Z"
  }
}
```

### Response
```json
{
  "success": true,
  "message": "Bulk notifications sent successfully"
}
```

---

## 3. Activity Tracking

### Get User Activities
**GET** `/activity-logs/my-activities`

Get current user's activity history.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `page` (number): Page number
- `limit` (number): Items per page
- `action` (string): Filter by action type
- `resource` (string): Filter by resource type
- `startDate` (string): Start date filter (ISO format)
- `endDate` (string): End date filter (ISO format)

### Response
```json
{
  "success": true,
  "message": "User activities retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity_id",
        "action": "LOGIN",
        "resource": "AUTH",
        "details": {
          "ipAddress": "192.168.1.1",
          "userAgent": "Mozilla/5.0..."
        },
        "timestamp": "2024-01-01T00:00:00.000Z",
        "user": {
          "fullName": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Get All Activities (Admin)
**GET** `/activity-logs/all`

Get all user activities (Admin only).

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Query Parameters
Same as user activities plus:
- `user` (string): Filter by specific user ID

### Get Activity Statistics
**GET** `/activity-logs/stats`

Get activity statistics and analytics.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Response
```json
{
  "success": true,
  "message": "Activity statistics retrieved successfully",
  "data": {
    "resourceStats": [
      {
        "_id": "AUTH",
        "actions": [
          {
            "action": "LOGIN",
            "count": 150,
            "lastActivity": "2024-01-01T00:00:00.000Z"
          }
        ],
        "totalCount": 200
      }
    ],
    "dailyStats": [
      {
        "_id": "2024-01-01",
        "count": 25
      }
    ]
  }
}
```

---

# Messaging System

## 1. Get Messages
**GET** `/messages/messages?senderId=user1&receiverId=user2`

Get messages between two users.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `senderId` (string, required): Sender user ID
- `receiverId` (string, required): Receiver user ID
- `page` (number): Page number
- `limit` (number): Messages per page
- `searchTerm` (string): Search in messages

### Response
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPage": 5
  },
  "data": [
    {
      "id": "message_id",
      "sender": {
        "firstName": "John",
        "lastName": "Doe",
        "image": "/images/profile.jpg"
      },
      "receiver": {
        "firstName": "Jane",
        "lastName": "Smith",
        "image": "/images/profile2.jpg"
      },
      "message": "Hello there!",
      "image": null,
      "isRead": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 2. Send Message with Image
**POST** `/messages/message-with-image`

Send a message with optional image attachment.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
data: {
  "senderId": "sender_user_id",
  "receiverId": "receiver_user_id",
  "message": "Hello with image!"
}
image: <image_file> (optional)
```

### Response
```json
{
  "success": true,
  "message": "Message created successfully",
  "data": {
    "id": "message_id",
    "sender": "sender_user_id",
    "receiver": "receiver_user_id",
    "message": "Hello with image!",
    "image": "/images/message-image.jpg",
    "isRead": false,
    "createAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

# Blog Management

## 1. Create Blog Post (Admin)
**POST** `/blog/create-blog`

Create a new blog post.

### Headers
```
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
data: {
  "title": "Blog Post Title",
  "description": "Blog post content here..."
}
image: <image_file>
```

### Response
```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "id": "blog_id",
    "title": "Blog Post Title",
    "description": "Blog post content here...",
    "image": "/images/blog-image.jpg",
    "author": "author_id",
    "date": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 2. Get All Blog Posts
**GET** `/blog/all-blogs`

Get all blog posts with pagination.

### Query Parameters
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

### Response
```json
{
  "success": true,
  "message": "All blogs retrieved successfully",
  "data": {
    "metadata": {
      "totalBlogs": 50,
      "totalPages": 5,
      "currentPage": 1,
      "pageSize": 10
    },
    "blogs": [
      {
        "id": "blog_id",
        "title": "Blog Post Title",
        "description": "Blog post content...",
        "image": "/images/blog-image.jpg",
        "author": {
          "fullName": "Admin User",
          "email": "admin@example.com"
        },
        "date": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

# Subscription Management

## 1. Get Available Plans
**GET** `/subscriptions/plans`

Get all available subscription plans.

### Response
```json
{
  "success": true,
  "message": "Available plans retrieved successfully",
  "data": [
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 9.99,
      "interval": "month",
      "features": ["Feature 1", "Feature 2"],
      "priceId": "price_basic"
    },
    {
      "id": "premium",
      "name": "Premium Plan",
      "price": 19.99,
      "interval": "month",
      "features": ["All Basic Features", "Feature 3", "Feature 4"],
      "priceId": "price_premium"
    }
  ]
}
```

---

## 2. Create Subscription
**POST** `/subscriptions/create`

Create a new subscription.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "plan": "basic",
  "price": 9.99,
  "paymentMethodId": "pm_card_visa",
  "trialDays": 7,
  "metadata": {
    "source": "web"
  }
}
```

### Response
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscriptionId": "sub_stripe_id",
    "clientSecret": "pi_client_secret",
    "status": "active",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "plan": "basic",
    "price": 9.99,
    "requiresAction": false,
    "trialEnd": "2024-01-08T00:00:00.000Z"
  }
}
```

---

## 3. Get Subscription Status
**GET** `/subscriptions/status`

Get current user's subscription status.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Subscription status retrieved successfully",
  "data": {
    "isSubscribed": true,
    "subscription": {
      "plan": "basic",
      "status": "active",
      "price": 9.99,
      "currency": "usd",
      "interval": "month",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "autoRenew": true,
      "trialEnd": null
    }
  }
}
```

---

# Content Management

## 1. Newsletter Management

### Subscribe to Newsletter
**POST** `/news-letter/subscribe-newsletter`

Subscribe to newsletter.

### Request Body
```json
{
  "email": "john@example.com",
  "name": "John Doe"
}
```

### Response
```json
{
  "success": true,
  "message": "Newsletter subscription successfully",
  "data": {
    "id": "newsletter_id",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

# WebSocket Events (Real-time)

## Connection
Connect to WebSocket server at: `ws://localhost:5000`

## Events

### Client to Server
- `register`: Register user for real-time updates
  ```javascript
  socket.emit('register', userId);
  ```

- `sendMessage`: Send a message
  ```javascript
  socket.emit('sendMessage', {
    senderId: 'user1',
    receiverId: 'user2',
    message: 'Hello!',
    image: 'optional_image_url'
  });
  ```

- `activeChat`: Set active chat session
  ```javascript
  socket.emit('activeChat', {
    senderId: 'user1',
    receiverId: 'user2'
  });
  ```

- `markAsRead`: Mark messages as read
  ```javascript
  socket.emit('markAsRead', {
    senderId: 'user1',
    receiverId: 'user2'
  });
  ```

- `typing`: Indicate user is typing
  ```javascript
  socket.emit('typing', {
    senderId: 'user1',
    receiverId: 'user2'
  });
  ```

- `heartbeat`: Keep user online
  ```javascript
  socket.emit('heartbeat', userId);
  ```

### Server to Client
- `receiver-{userId}`: Receive new message
- `message-sent`: Message delivery confirmation
- `messages-read`: Messages marked as read
- `userTyping`: User typing indicator
- `userStoppedTyping`: Stop typing indicator
- `onlineUsers`: List of online users
- `user:online`: User came online
- `user:offline`: User went offline
- `notification:{userId}`: New notification

---

# Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# Rate Limiting

The API implements rate limiting to prevent abuse:
- **General API**: 100 requests per minute per IP
- **Authentication**: 50 requests per minute per IP
- **File Upload**: 20 requests per minute per IP

---

# File Upload Guidelines

## Supported File Types
- **Images**: JPG, JPEG, PNG, WEBP, GIF
- **Documents**: PDF
- **Media**: MP4 (video), MP3 (audio)

## File Size Limits
- **Images**: 5MB maximum
- **Documents**: 10MB maximum
- **Media files**: 50MB maximum

---

# Postman Collection

You can import this Postman collection to test all endpoints:

```json
{
  "info": {
    "name": "Whisky Cask Club API",
    "description": "Complete API collection for Whisky Cask Club Backend",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api/v1"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  }
}
```

---

# Environment Variables for Testing

```env
# Development
DEV_BASE_URL=http://localhost:5000/api/v1
DEV_WS_URL=ws://localhost:5000

# Production
PROD_BASE_URL=https://your-domain.com/api/v1
PROD_WS_URL=wss://your-domain.com
```

---

# Support

For support and questions:
- Email: support@whiskycaskclub.com
- Documentation: This file
- Issues: Create an issue in the repository

---

# License

This project is licensed under the ISC License.