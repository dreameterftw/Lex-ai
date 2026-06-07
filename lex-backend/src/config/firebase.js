// src/config/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables before initialising
const requiredVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL"
];

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Initialise Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });
}

// Export the services we use
const db = admin.firestore();
const auth = admin.auth();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true  // prevents errors on undefined fields
});

export { db, auth };
export default admin;
