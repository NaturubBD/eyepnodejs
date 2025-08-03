const admin = require("firebase-admin");

const firebaseConfig = {
  apiKey: "AIzaSyBtBdnnL13O9V5JJ_CLFbzDYiobt7AcZaY",
  authDomain: "beh-app-a89f1.firebaseapp.com",
  projectId: "beh-app-a89f1",
  storageBucket: "beh-app-a89f1.appspot.com",
  messagingSenderId: "382784092287",
  appId: "1:382784092287:web:a6d986a0beabb6174ca74a",
  measurementId: "G-Q0GZWKFLLQ",
};
module.exports = function () {
  global.firebase = admin.initializeApp(firebaseConfig);
};
