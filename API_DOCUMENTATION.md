# Backend Template API Documentation

## Overview
This is a comprehensive backend API built with Node.js, Express.js, MongoDB, and TypeScript. It provides authentication, user management, subscription handling, blog management, messaging, and various utility endpoints.

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
      "isSubscribed": false
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

## 2. Get Single User (Admin)
**GET** `/user/:id`

Get specific user details.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Response
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "verified": true,
    "isSubscribed": false,
    "subscription": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 3. Update User (Admin)
**PATCH** `/user/:id`

Update any user's information (Admin only).

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Request Body
```json
{
  "fullName": "Updated Name",
  "role": "USER",
  "status": "ACTIVE",
  "verified": true,
  "isSubscribed": false
}
```

### Response
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_id",
    "fullName": "Updated Name",
    "role": "USER",
    "status": "ACTIVE"
  }
}
```

---

## 4. Change User Status (Admin)
**PATCH** `/user/:id/status`

Change user's status.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Request Body
```json
{
  "status": "INACTIVE"
}
```

### Response
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "user_id",
    "status": "INACTIVE"
  }
}
```

---

## 5. Delete User (Admin)
**DELETE** `/user/:id`

Delete any user account (Admin only).

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Response
```json
{
  "success": true,
  "message": "User deleted successfully"
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

## 3. Get Single Blog Post
**GET** `/blog/blog-details/:id`

Get specific blog post details.

### Response
```json
{
  "success": true,
  "message": "Blog retrieved successfully",
  "data": {
    "id": "blog_id",
    "title": "Blog Post Title",
    "description": "Full blog post content here...",
    "image": "/images/blog-image.jpg",
    "author": {
      "fullName": "Admin User",
      "email": "admin@example.com"
    },
    "date": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 4. Update Blog Post (Admin)
**PATCH** `/blog/update-blog/:id`

Update existing blog post.

### Headers
```
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
data: {
  "title": "Updated Blog Title",
  "description": "Updated blog content..."
}
image: <new_image_file> (optional)
```

### Response
```json
{
  "success": true,
  "message": "Blog updated successfully",
  "data": {
    "id": "blog_id",
    "title": "Updated Blog Title",
    "description": "Updated blog content...",
    "image": "/images/updated-blog-image.jpg"
  }
}
```

---

## 5. Delete Blog Post (Admin)
**DELETE** `/blog/delete-blog/:id`

Delete blog post.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Response
```json
{
  "success": true,
  "message": "Blog deleted successfully",
  "data": null
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

## 4. Cancel Subscription
**POST** `/subscriptions/cancel`

Cancel current subscription.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "message": "Subscription will be cancelled at the end of the current period",
    "cancelAtPeriodEnd": "2024-02-01T00:00:00.000Z",
    "status": "active"
  }
}
```

---

## 5. Reactivate Subscription
**POST** `/subscriptions/reactivate`

Reactivate cancelled subscription.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Subscription reactivated successfully",
  "data": {
    "message": "Subscription has been reactivated",
    "status": "active"
  }
}
```

---

## 6. Change Subscription Plan
**PATCH** `/subscriptions/change-plan`

Change subscription plan.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "plan": "premium"
}
```

### Response
```json
{
  "success": true,
  "message": "Subscription plan changed successfully",
  "data": {
    "subscriptionId": "sub_stripe_id",
    "status": "active",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "plan": "premium",
    "price": 19.99
  }
}
```

---

## 7. Sync Subscription Status
**POST** `/subscriptions/sync`

Sync subscription status with Stripe.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Subscription status synchronized successfully",
  "data": {
    "id": "user_id",
    "isSubscribed": true,
    "subscription": {
      "status": "active",
      "plan": "basic"
    }
  }
}
```

---

## 8. Get Subscription Metrics (Admin)
**GET** `/subscriptions/metrics`

Get subscription analytics and metrics.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Response
```json
{
  "success": true,
  "message": "Subscription metrics retrieved successfully",
  "data": {
    "activeSubscriptions": 150,
    "inactiveUsers": 50,
    "totalUsers": 200,
    "planDistribution": [
      {
        "_id": "basic",
        "count": 100
      },
      {
        "_id": "premium",
        "count": 50
      }
    ],
    "statusDistribution": [
      {
        "_id": "active",
        "count": 140
      },
      {
        "_id": "cancelled",
        "count": 10
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

# Newsletter Management

## 1. Subscribe to Newsletter
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

## 2. Get All Newsletter Subscribers (Admin)
**GET** `/news-letter/all-newsletters`

Get all newsletter subscribers.

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Query Parameters
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

### Response
```json
{
  "success": true,
  "message": "All newsletters retrieved successfully",
  "data": {
    "result": [
      {
        "id": "newsletter_id",
        "email": "john@example.com",
        "name": "John Doe",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalData": 100,
    "page": 1,
    "limit": 10
  }
}
```

---

# Content Management

## 1. About Us Management

### Create About Us (Admin)
**POST** `/about/create-about`

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Request Body
```json
{
  "description": "About us content here..."
}
```

### Get About Us
**GET** `/about/`

### Update About Us (Admin)
**POST** `/about/update-about`

### Headers
```
Authorization: Bearer <admin_access_token>
```

### Request Body
```json
{
  "description": "Updated about us content..."
}
```

---

## 2. Privacy Policy Management

### Create Privacy Policy (Admin)
**POST** `/privacy/create-privacy`

### Get Privacy Policy
**GET** `/privacy/`

### Update Privacy Policy (Admin)
**POST** `/privacy/update-privacy`

---

## 3. Terms and Conditions Management

### Create Terms (Admin)
**POST** `/terms/create-terms-condition`

### Get Terms
**GET** `/terms/`

### Update Terms (Admin)
**POST** `/terms/update-terms-condition`

---

## 4. Settings Management

### Create Settings (Admin)
**POST** `/setting/create-setting`

### Get Settings
**GET** `/setting/`

### Update Settings (Admin)
**POST** `/setting/update-setting`

---

# Webhook Endpoints

## 1. Stripe Webhook
**POST** `/my-webhook/stripe`

Handle Stripe webhook events for subscription management.

### Headers
```
stripe-signature: <stripe_signature>
Content-Type: application/json
```

### Request Body
Raw Stripe webhook payload

### Response
```json
{
  "received": true
}
```

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
| 500 | Internal Server Error |

---

# Rate Limiting

The API implements rate limiting to prevent abuse. Current limits:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

---

# File Upload Guidelines

## Supported File Types
- **Images**: JPG, JPEG, PNG, GIF
- **Documents**: PDF
- **Media**: MP4 (video), MP3 (audio)

## File Size Limits
- Images: 10MB maximum
- Documents: 20MB maximum
- Media files: 50MB maximum

## Upload Endpoints
All file uploads use `multipart/form-data` encoding and require authentication.

---

# WebSocket Events (Real-time Messaging)

## Connection
Connect to WebSocket server at: `ws://localhost:5000`

## Events

### Client to Server
- `register`: Register user for real-time updates
- `sendMessage`: Send a message
- `activeChat`: Set active chat session
- `markAsRead`: Mark messages as read
- `typing`: Indicate user is typing
- `stopTyping`: Stop typing indicator

### Server to Client
- `receiver-{userId}`: Receive new message
- `message-sent`: Message delivery confirmation
- `messages-read`: Messages marked as read
- `userTyping`: User typing indicator
- `userStoppedTyping`: Stop typing indicator
- `onlineUsers`: List of online users

---

# Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
IP_ADDRESS=localhost

# Database
DATABASE_URL=mongodb://localhost:27017/backend-template

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=30d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Email Configuration
EMAIL_FROM=noreply@yourapp.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Admin Configuration
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@yourapp.com
ADMIN_PASSWORD=SecureAdminPassword123!

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Maps API (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

# Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Copy `.env.example` to `.env` and fill in your values
4. **Start MongoDB**: Ensure MongoDB is running
5. **Run the application**: `npm run dev`
6. **Access the API**: `http://localhost:5000/api/v1`

---

# Postman Collection

Import the following Postman collection to test all endpoints:

```json
{
  "info": {
    "name": "Backend Template API",
    "description": "Complete API collection for the backend template",
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
  ]
}
```

---

# Support

For support and questions:
- Email: support@yourapp.com
- Documentation: This file
- Issues: Create an issue in the repository

---

# License

This project is licensed under the ISC License.