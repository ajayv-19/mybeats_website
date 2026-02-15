const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  "de4endh728bucn", // Database name
  "u7de1gksepndnt", // Username
  "p1c2333014360621da7529c12e4913683745a2a7fbbd989c81b27cdcd6ff192bb", // Password
  {
    host: "cc01ok1186700o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
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
      max: 1, // One connection per Lambda to avoid DB role connection limit
      min: 0,
      acquire: 30000,
      idle: 3000, // Release idle connection quickly
      evict: 1000,
    },
  }
  
);

module.exports = { sequelize, DataTypes };
