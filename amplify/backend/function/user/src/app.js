const express = require("express");
const bodyParser = require("body-parser");
const { API_PREFIX } = require("./globals.const");
const {
  awsServerlessExpressMiddleware,
  conditionalAuthMiddleware,
} = require("./middlewares");
const { UserController, PaymentController } = require("./controllers");
const upload = require("./config/multer");
// Declare a new express app
const app = express();
app.use(bodyParser.json());

// Apply conditional middleware globally
app.use(conditionalAuthMiddleware);
app.use(awsServerlessExpressMiddleware.eventContext());

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
// router.post("/addOrUpdateUserDetails", UserController.addOrUpdateUserDetails);
router.post(
  "/addOrUpdateUserDetails",
  upload.single("image"),
  UserController.addOrUpdateUserDetails
);

router.get("/canShowBilling", UserController.canShowBilling);

PaymentController.setupRoutes(router);
CompanyController.setupRoutes(router);
// Use router for specific path
app.use(API_PREFIX, router);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});

module.exports = app;
