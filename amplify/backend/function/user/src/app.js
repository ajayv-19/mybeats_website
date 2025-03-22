const express = require("express");
const bodyParser = require("body-parser");
// const admin = require("firebase-admin");
const { API_PREFIX } = require("./globals.const");
const {
  awsServerlessExpressMiddleware,
  validateScheduleToken,
  conditionalAuthMiddleware,
} = require("./middlewares");
// const { getFirestore } = require("firebase-admin/firestore");
const {
  UserController,
  PaymentController,
  CompanyController,
  ScheduleController,
  EmailController,
  PolicyholdersController,
} = require("./controllers");
const upload = require("./config/multer");
// var serviceAccount = require("./config/firebeats-43aaf-firebase-adminsdk-xfr1d-c158bfaef9.json");
// Declare a new express app
const app = express();
app.use(bodyParser.json());

// Apply conditional middleware globally
app.use(conditionalAuthMiddleware);
app.use(awsServerlessExpressMiddleware.eventContext());

// Initialize Firebase Admin SDK
//var admin = require("firebase-admin");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://firebeats-43aaf-default-rtdb.firebaseio.com",
// });

// const db = admin.firestore();
// module.exports = db;

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});



// Define routes
const router = express.Router();
router.get("/checkusers", UserController.checkUserById);
router.get("/users", UserController.getUserById);
router.put("/updateUser", UserController.updateUser);
router.post("/updaterole", UserController.updateUserRole);
router.post("/addcomment", UserController.addComment);
router.post(
  "/policyholders",
  PolicyholdersController.policyHolderListUpload
);
router.get("/health", PolicyholdersController.healthCheck)

// router.post("/addOrUpdateUserDetails", UserController.addOrUpdateUserDetails);
router.post(
  "/addOrUpdateUserDetails",
  upload.single("image"),
  UserController.addOrUpdateUserDetails
);

router.get("/listInvitedUsers", UserController.listInvitedUsers);
router.post("/invitedUserAccess", UserController.InvitedUserAccess);
router.get("/canShowBilling", UserController.canShowBilling);
router.post("/deactivate-user", (...args) =>
  UserController.DeActivateUserQs(...args)
);
router.post("/delete-user", (...args) => UserController.DeleteUserQs(...args));

PaymentController.setupRoutes(router);
CompanyController.setupRoutes(router);
ScheduleController.setupRoutes(router);
EmailController.setupRoutes(router);
// Use router for specific path
app.use(API_PREFIX, router);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});

module.exports = app;
// Changed
