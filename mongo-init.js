// mongo-init.js
db = db.getSiblingDB('backend-template-db');
db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'backend-template-db',
    },
  ],
});
