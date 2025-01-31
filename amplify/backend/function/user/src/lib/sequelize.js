const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  "d4cndihsitnn9n", // Database name
  "u7de1gksepndnt", // Username
  "pc9cf448765b86e4e33da258b19cb59a9c52c61efcea2fa686a2cd24170ef2bd0", // Password
  {
    host: "c3gtj1dt5vh48j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    logging: false, // Optional: Disables logging of SQL queries to console
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Set to true if you want stricter SSL security checks
      },
    },
    pool: {
      max: 10, // Max 10 connections
      min: 2, // Keep 2 connections open
      acquire: 30000, // Wait before throwing error
      idle: 10000, // Close idle connections after 10 seconds
    },
  }
  
);

module.exports = { sequelize, DataTypes };
