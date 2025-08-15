// MongoDB initialization script
db = db.getSiblingDB('backend-template');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['fullName', 'email', 'password'],
      properties: {
        fullName: {
          bsonType: 'string',
          description: 'Full name is required',
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Valid email is required',
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Password must be at least 8 characters',
        },
        phoneNumber: {
          bsonType: 'string',
          description: 'Phone number',
        },
        role: {
          bsonType: 'string',
          enum: ['user', 'admin', 'moderator'],
          description: 'User role',
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'inactive', 'suspended', 'pending'],
          description: 'User status',
        },
        isOnline: {
          bsonType: 'bool',
          description: 'User online status',
        },
      },
    },
  },
});

// Create users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 });
db.users.createIndex({ role: 1, status: 1 });
db.users.createIndex({ isOnline: 1 });
db.users.createIndex({ 'subscription.stripeCustomerId': 1 });
db.users.createIndex({ 'subscription.stripeSubscriptionId': 1 });
db.users.createIndex({ createdAt: -1 });

// Create activity logs collection
db.createCollection('activitylogs');
db.activitylogs.createIndex({ user: 1, timestamp: -1 });
db.activitylogs.createIndex({ action: 1, timestamp: -1 });
db.activitylogs.createIndex({ resource: 1, timestamp: -1 });
db.activitylogs.createIndex({ timestamp: -1 });

// Create notifications collection
db.createCollection('notifications');
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 });
db.notifications.createIndex({ type: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: -1 });

// Create messages collection
db.createCollection('messages');
db.messages.createIndex({ sender: 1, receiver: 1, createdAt: -1 });
db.messages.createIndex({ sender: 1, createdAt: -1 });
db.messages.createIndex({ receiver: 1, createdAt: -1 });
db.messages.createIndex({ createdAt: -1 });

// Create blogs collection
db.createCollection('blogs');
db.blogs.createIndex({ author: 1 });
db.blogs.createIndex({ status: 1, createdAt: -1 });
db.blogs.createIndex({ category: 1 });
db.blogs.createIndex({ tags: 1 });
db.blogs.createIndex({ createdAt: -1 });

// Create sessions collection for user sessions
db.createCollection('sessions');
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create payments collection for Stripe integration
db.createCollection('payments');
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex(
  { stripePaymentIntentId: 1 },
  { unique: true, sparse: true },
);
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: -1 });

// Create subscriptions collection
db.createCollection('subscriptions');
db.subscriptions.createIndex({ userId: 1 }, { unique: true });
db.subscriptions.createIndex({ stripeCustomerId: 1 });
db.subscriptions.createIndex(
  { stripeSubscriptionId: 1 },
  { unique: true, sparse: true },
);
db.subscriptions.createIndex({ status: 1 });
db.subscriptions.createIndex({ planType: 1 });

// Create file uploads collection
db.createCollection('uploads');
db.uploads.createIndex({ userId: 1, createdAt: -1 });
db.uploads.createIndex({ fileType: 1 });
db.uploads.createIndex({ createdAt: -1 });

// Create system settings collection
db.createCollection('settings');
db.settings.createIndex({ key: 1 }, { unique: true });

print('Database initialized successfully with collections and indexes');
print('Collections created:');
print('- users (with validation)');
print('- activitylogs');
print('- notifications');
print('- messages');
print('- blogs');
print('- sessions');
print('- payments');
print('- subscriptions');
print('- uploads');
print('- settings');
print('All indexes created successfully');
