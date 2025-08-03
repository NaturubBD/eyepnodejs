const admin = require("firebase-admin");

// Initialize Firebase Admin with service account credentials
const serviceAccount = require("../../src/keys/beh-app.json");

module.exports = function () {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  global.firebase = admin;
};
