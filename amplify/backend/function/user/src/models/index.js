const { create } = require("lodash");
const { sequelize, DataTypes } = require("../lib/sequelize");

// Authenticate database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: true },
    Company_Name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: true },
    Customer_Name: { type: DataTypes.STRING, allowNull: true },
    usertype: { type: DataTypes.STRING, allowNull: true },
    created_timestamp: { type: DataTypes.DATE, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
    domain: { type: DataTypes.STRING, allowNull: true },
    removedByAdmin: { type: DataTypes.BOOLEAN, allowNull: true },
    is_varified: { type: DataTypes.BOOLEAN, allowNull: true },
    is_invited: { type: DataTypes.BOOLEAN, allowNull: true },
    invited_by: { type: DataTypes.INTEGER, allowNull: true },
    company_id: { type: DataTypes.INTEGER, allowNull: true }
  },
  { tableName: "RLS", timestamps: false } // Assuming table name is "RLS" and timestamps are not auto-managed
);

const Company = sequelize.define(
  "Company",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    Company_Name: { type: DataTypes.TEXT, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    domain: { type: DataTypes.STRING, allowNull: false },
    plan_type: { type: DataTypes.TEXT, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    // admin_id: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },

    subscription_id: { type: DataTypes.INTEGER, allowNull: true },
    plan_id: { type: DataTypes.INTEGER, allowNull: true },
    primary_user_id: { type: DataTypes.INTEGER, allowNull: false },
    purchased_date: { type: DataTypes.DATE, allowNull: true },
    last_renewal: { type: DataTypes.DATE, allowNull: true },
    expiry_date: { type: DataTypes.DATE, allowNull: true },
    number_of_users_invited: { type: DataTypes.INTEGER, allowNull: true },
    number_of_users_accepted: { type: DataTypes.INTEGER, allowNull: true },
    number_of_admins: { type: DataTypes.INTEGER, allowNull: true },
    license_used: { type: DataTypes.INTEGER, allowNull: true },
    phone_number: { type: DataTypes.STRING, allowNull: true },
    policyholder_count: { type: DataTypes.INTEGER, allowNull: true },
    is_subscribed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "Subscribed_Companies", // Replace with your actual table name
    timestamps: false, // Enable if your table includes createdAt/updatedAt
  }
);

const Plans = sequelize.define(
  "Plans",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pricing: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    team_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    feature_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    interval: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interval_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Plans",
    tableName: "Plans", // Explicitly specify the table name
    timestamps: false, // Set to true if your table includes createdAt/updatedAt fields
  }
);

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "Role", // Explicitly specify the table name
    timestamps: false, // Set to true if your table includes createdAt/updatedAt fields
  }
);

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vendor: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transaction_payload: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "Payment", // Explicitly specify the table name
    timestamps: false, // Set to true if your table includes createdAt/updatedAt fields
  }
);

const Subscriptions = sequelize.define(
  "Subscriptions",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company_id: { type: DataTypes.INTEGER, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    starts_at: { type: DataTypes.DATE, allowNull: true },
    ends_at: { type: DataTypes.DATE, allowNull: true },
    isactive: { type: DataTypes.BOOLEAN, allowNull: true },
    plan_id: { type: DataTypes.INTEGER, allowNull: true },
    payment_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: "Subscriptions",
    tableName: "Subscriptions", // Explicitly specify the table name
    timestamps: false, // Set to true if your table includes createdAt/updatedAt fields
  }
);

const NewSubscriptions = sequelize.define(
  "NewSubscriptions",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sub_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensures each Stripe subscription ID is unique
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be NULL if it's a company-wide subscription
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be NULL if it's a user-specific subscription
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // Subscription amount is required
    },
    bill_start: {
      type: DataTypes.DATE,
      allowNull: false, // Start date is required
    },
    bill_end: {
      type: DataTypes.DATE,
      allowNull: false, // End date is required
    },
    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "INACTIVE",
        "CANCELED",
        "PENDING_CANCELLATION",
        "PAYMENT_FAILED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "NewSubscriptions",
    tableName: "New_Subscriptions", // Updated table name
    timestamps: false, // Set to true if your table includes createdAt/updatedAt fields
  }
);

const CustomerQueries = sequelize.define(
  "CustomerQueries",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CustomerQueries",
    tableName: "Customer_queries", // Explicitly specify the table name
    timestamps: false, // Assuming there are no createdAt/updatedAt fields
  }
);

const UserInvites = sequelize.define(
  "UserInvites",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invitedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    invited_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "UserInvites",
    tableName: "user_invites", // Explicitly specify the table name
    timestamps: false, // Assuming there are no createdAt/updatedAt fields
  }
);

User.belongsTo(Role, { foreignKey: "role_id" });
User.belongsTo(Company, { foreignKey: "company_id" });
User.hasMany(UserInvites, { foreignKey: "invitedBy", as: "Invitations" });
UserInvites.belongsTo(User, { foreignKey: "invitedBy", as: "Inviter" });

module.exports = {
  User,
  Company,
  Plans,
  Role,
  Payment,
  Subscriptions,
  NewSubscriptions,
  UserInvites,
  sequelize,
  CustomerQueries,
};
// Changed