/* eslint-disable no-undef */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url:
    process.env.DATABASE_URL || 'mongodb://localhost:27017/backend-template-db',
  node_env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  google_maps: process.env.GOOGLE_MAPS_API_KEY,

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    clientCertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
  },

  upload: {
    folder: process.env.UPLOAD_FOLDER || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ],
  },

  jwt: {
    jwt_secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    jwt_expire_in: process.env.JWT_EXPIRE_IN || '7d',
    jwtRefreshSecret:
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    localWebhookSecret: process.env.LOCAL_STRIPE_WEBHOOK_SECRET,
  },

  email: {
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    user: process.env.EMAIL_USER || '',
    port: process.env.EMAIL_PORT || 587,
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    pass: process.env.EMAIL_PASS || '',
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  },
};
