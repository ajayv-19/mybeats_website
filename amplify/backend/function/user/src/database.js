// const admin = require("firebase-admin");
// const { getFirestore } = require("firebase-admin/firestore");
// var serviceAccount = require("./config/firebeats-43aaf-firebase-adminsdk-xfr1d-c158bfaef9.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://firebeats-43aaf-default-rtdb.firebaseio.com",
//   });

//   const db = admin.firestore();
// module.exports = db;

const admin = require("firebase-admin");
const serviceAccount = require("./config/firebeats-43aaf-firebase-adminsdk-xfr1d-c158bfaef9.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firebeats-43aaf-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
module.exports = db;
