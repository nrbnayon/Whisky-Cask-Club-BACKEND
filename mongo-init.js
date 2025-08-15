// MongoDB initialization script
db = db.getSiblingDB('whisky-backend');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['fullName', 'email', 'password'],
      properties: {
        fullName: {
          bsonType: 'string',
          description: 'Full name is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Valid email is required'
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Password must be at least 8 characters'
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 });
db.users.createIndex({ role: 1, status: 1 });
db.users.createIndex({ isOnline: 1 });
db.users.createIndex({ 'subscription.stripeCustomerId': 1 });
db.users.createIndex({ 'subscription.stripeSubscriptionId': 1 });

// Activity logs indexes
db.activitylogs.createIndex({ user: 1, timestamp: -1 });
db.activitylogs.createIndex({ action: 1, timestamp: -1 });
db.activitylogs.createIndex({ resource: 1, timestamp: -1 });
db.activitylogs.createIndex({ timestamp: -1 });

// Notifications indexes
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 });
db.notifications.createIndex({ type: 1, createdAt: -1 });

// Messages indexes
db.messages.createIndex({ sender: 1, receiver: 1, createdAt: -1 });
db.messages.createIndex({ createdAt: -1 });

// Blogs indexes
db.blogs.createIndex({ author: 1 });
db.blogs.createIndex({ createdAt: -1 });

print('Database initialized successfully with collections and indexes');