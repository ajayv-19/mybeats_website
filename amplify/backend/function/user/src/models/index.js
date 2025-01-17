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
    company_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "RLS", timestamps: false } // Assuming table name is "RLS" and timestamps are not auto-managed
);

const Company = sequelize.define(
  "Company",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    Company_Name: { type: DataTypes.TEXT, allowNull: true },
    domain: { type: DataTypes.STRING, allowNull: true },
    plan_type: { type: DataTypes.TEXT, allowNull: true },
    // admin_id: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },
    subscription_id: { type: DataTypes.INTEGER, allowNull: true },
    plan_id: { type: DataTypes.INTEGER, allowNull: true },
    purchased_date: { type: DataTypes.DATE, allowNull: true },
    last_renewal: { type: DataTypes.DATE, allowNull: true },
    expiry_date: { type: DataTypes.DATE, allowNull: true },
    number_of_users_invited: { type: DataTypes.INTEGER, allowNull: true },
    number_of_users_accepted: { type: DataTypes.INTEGER, allowNull: true },
    phone_number: { type: DataTypes.STRING, allowNull: true },
    policyholder_count: { type: DataTypes.INTEGER, allowNull: true },
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
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isactive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Subscriptions",
    tableName: "Subscriptions", // Explicitly specify the table name
    timestamps: false, // Set to true if your table includes createdAt/updatedAt fields
  }
);

module.exports = {
  User,
  Company,
  Plans,
  Role,
  Payment,
  Subscriptions,
  sequelize,
};
