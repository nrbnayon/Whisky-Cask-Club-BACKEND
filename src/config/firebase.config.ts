// src/config/firebase.config.ts
import admin from 'firebase-admin';
import config from './index';
import { logger } from '../shared/logger';

let firebaseApp: admin.app.App | null = null;

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const serviceAccount = {
      type: 'service_account',
      project_id: config.firebase.projectId,
      private_key_id: config.firebase.privateKeyId,
      private_key: config.firebase.privateKey?.replace(/\\n/g, '\n'),
      client_email: config.firebase.clientEmail,
      client_id: config.firebase.clientId,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: config.firebase.clientCertUrl,
    };

    if (!admin.apps.length) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      logger.info('Firebase initialized successfully');
    } else {
      firebaseApp = admin.app();
    }

    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    return null;
  }
};

// Initialize Firebase
const app = initializeFirebase();

export const messaging = app ? admin.messaging(app) : null;
export const firestore = app ? admin.firestore(app) : null;

export default admin;