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

// models/FormData.js
const FormData = sequelize.define(
  "FormData",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.TEXT,      // nullable → allowNull defaults to true
    },

    company_id: {
      type: DataTypes.INTEGER,
    },

    type: {
      type: DataTypes.TEXT,
    },

    // Postgres-style JSON/JSONB column
    data: {
      type: DataTypes.JSONB,     // use JSON if you’re on MySQL
    },

    updated_by: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    insurance_company: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    fire_department: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    application_status: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    year: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    fire_department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "fire_departments",
        key: "fire_department_id",
      },
    },

    // created_at / updated_at will be handled by Sequelize
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    }

  },
  {
    sequelize,
    modelName: "FormData",
    tableName: "Form_Data",          // exact DB table name
    timestamps: true,                // turn on automatic timestamps
    createdAt: "created_at",         // map to snake-case column names
    updatedAt: "updated_at",            // turn on automatic timestamps
    // keeps any future columns snake-cased
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

// Fire Departments Model
const FireDepartment = sequelize.define(
  "FireDepartment",
  {
    fire_department_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Subscribed_Companies",
        key: "id",
      },
    },
    fire_department_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    county: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  },
  {
    sequelize,
    modelName: "FireDepartment",
    tableName: "fire_departments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Fire Department Profile Model
const FireDepartmentProfile = sequelize.define(
  "FireDepartmentProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fire_department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fire_departments",
        key: "fire_department_id",
      },
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Subscribed_Companies",
        key: "id",
      },
    },
    population: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    square_miles: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    fire_calls: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ems_calls: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    motorized_racing_team: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    hs_officers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    safety_committee: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    customer_since: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    renewal_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    valuation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    effective_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    effective_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "FireDepartmentProfile",
    tableName: "fire_department_profile",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["fire_department_id", "company_id", "effective_from"],
        name: "uq_fd_profile_effective",
      },
    ],
  }
);

// Underwriting Model
const Underwriting = sequelize.define(
  "Underwriting",
  {
    uw_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fire_department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fire_departments",
        key: "fire_department_id",
      },
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Subscribed_Companies",
        key: "id",
      },
    },
    underwriting_year: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    form_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Form_Data",
        key: "id",
      },
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "category", // DB column is "category"; we use "type" in code (initial/renewal)
    },
    vfbl: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    wc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    total_premium: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    losses: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    lae: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    total_loss_lae: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    loss_ratio: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    number_of_claims: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pr_factor: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
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
  },
  {
    sequelize,
    modelName: "Underwriting",
    tableName: "underwriting",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["fire_department_id", "underwriting_year"],
        name: "uq_underwriting_fd_year",
      },
    ],
  }
);

// Underwriting Results Model
const UnderwritingResults = sequelize.define(
  "UnderwritingResults",
  {
    uw_result_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fire_department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fire_departments",
        key: "fire_department_id",
      },
    },
    underwriting_year: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    loss_ratio_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    density_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    call_volume_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    frequency_factor_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    safety_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hso_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    racing_penalty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    adjustments: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assigned_company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Subscribed_Companies",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "UnderwritingResults",
    tableName: "underwriting_results",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["fire_department_id", "underwriting_year"],
        name: "uq_uw_results_fd_year",
      },
    ],
  }
);

// Policies Model
const Policy = sequelize.define(
  "Policy",
  {
    policy_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fire_department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fire_departments",
        key: "fire_department_id",
      },
    },
    underwriting_year: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    assigned_company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Subscribed_Companies",
        key: "id",
      },
    },
    policy_value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    policy_number: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
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
  },
  {
    sequelize,
    modelName: "Policy",
    tableName: "policies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["fire_department_id", "underwriting_year"],
        name: "uq_policy_fd_year",
      },
    ],
  }
);

// Lookup Tables
const LookupLossRatioPoints = sequelize.define(
  "LookupLossRatioPoints",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    min_value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    max_value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LookupLossRatioPoints",
    tableName: "lookup_loss_ratio_points",
    timestamps: false,
  }
);

const LookupDensityPoints = sequelize.define(
  "LookupDensityPoints",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    min_value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    max_value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LookupDensityPoints",
    tableName: "lookup_density_points",
    timestamps: false,
  }
);

const LookupCallVolumePoints = sequelize.define(
  "LookupCallVolumePoints",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    min_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LookupCallVolumePoints",
    tableName: "lookup_call_volume_points",
    timestamps: false,
  }
);

const LookupFrequencyPoints = sequelize.define(
  "LookupFrequencyPoints",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    min_value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    max_value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LookupFrequencyPoints",
    tableName: "lookup_frequency_points",
    timestamps: false,
  }
);

const LookupPenalties = sequelize.define(
  "LookupPenalties",
  {
    code: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LookupPenalties",
    tableName: "lookup_penalties",
    timestamps: false,
  }
);

// Define associations
FireDepartment.belongsTo(Company, { foreignKey: "company_id", as: "company" });
FireDepartment.hasMany(FireDepartmentProfile, {
  foreignKey: "fire_department_id",
  as: "profiles",
});
FireDepartment.hasMany(Underwriting, {
  foreignKey: "fire_department_id",
  as: "underwriting",
});
FireDepartment.hasMany(UnderwritingResults, {
  foreignKey: "fire_department_id",
  as: "results",
});
FireDepartment.hasMany(Policy, {
  foreignKey: "fire_department_id",
  as: "policies",
});

Underwriting.belongsTo(Company, { foreignKey: "company_id", as: "company" });
UnderwritingResults.belongsTo(Company, {
  foreignKey: "assigned_company_id",
  as: "assignedCompany",
});
Policy.belongsTo(Company, {
  foreignKey: "assigned_company_id",
  as: "assignedCompany",
});

// Form Message Model (matches Agent_Messages table)
const FormMessage = sequelize.define(
  "FormMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    form_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Form_Data",
        key: "id",
      },
    },
    sender_id: {
      type: DataTypes.STRING, // VARCHAR - stores email addresses
      allowNull: true,
    },
    receiver_id: {
      type: DataTypes.STRING, // VARCHAR - stores email addresses
      allowNull: true,
    },
    message: {
      type: DataTypes.JSONB, // JSON type for storing structured message data
      allowNull: true,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "FormMessage",
    tableName: "Agent_Messages", // Matches actual table name
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Document Attachment Model (matches Documents_attachment table)
const DocumentAttachment = sequelize.define(
  "DocumentAttachment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    form_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Form_Data",
        key: "id",
      },
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "DocumentAttachment",
    tableName: "Documents_attachment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

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
  FormData,
  FireDepartment,
  FireDepartmentProfile,
  Underwriting,
  UnderwritingResults,
  Policy,
  LookupLossRatioPoints,
  LookupDensityPoints,
  LookupCallVolumePoints,
  LookupFrequencyPoints,
  LookupPenalties,
  FormMessage,
  DocumentAttachment,
};
// Changed