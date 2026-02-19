const express = require("express");
const bodyParser = require("body-parser");
const { API_PREFIX } = require("./globals.const");
const {
  awsServerlessExpressMiddleware,
  conditionalAuthMiddleware,
} = require("./middlewares");
const {
  UserController,
  PaymentController,
  CompanyController,
  ScheduleController,
  EmailController,
  PolicyholdersController,
  AgentController,
  UnderwritingController,
  AnalysisController,
} = require("./controllers");
const upload = require("./config/multer");

const app = express();
app.use(bodyParser.json());

// Enable CORS for all methods (must be before auth middleware to handle OPTIONS requests)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

// Apply conditional middleware globally
app.use(conditionalAuthMiddleware);
app.use(awsServerlessExpressMiddleware.eventContext());

// Define routes
const router = express.Router();

// UserController routes
router.get("/checkusers", UserController.checkUserById);
router.get("/users", UserController.getUserById);
router.put("/updateUser", UserController.updateUser);
router.post("/updaterole", UserController.updateUserRole);
router.post("/addcomment", UserController.addComment);
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

// Setup routes for other controllers
PaymentController.setupRoutes(router);
CompanyController.setupRoutes(router);
ScheduleController.setupRoutes(router);
EmailController.setupRoutes(router);
PolicyholdersController.setupRoutes(router);
AgentController.setupRoutes(router);
UnderwritingController.setupRoutes(router);
AnalysisController.setupRoutes(router);

// Use PolicyholdersController router
//app.use(`${API_PREFIX}/policyholders`, PolicyholdersController.router);

// Use router for other paths
app.use(API_PREFIX, router);

// 404 handler for routes that don't exist
app.use((req, res) => {
  console.error(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err);
  console.error("[Global Error Handler] Stack:", err.stack);
  console.error("[Global Error Handler] Path:", req.path);
  console.error("[Global Error Handler] Method:", req.method);
  
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});

module.exports = app;