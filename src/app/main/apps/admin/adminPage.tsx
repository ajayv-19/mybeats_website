import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    "& > .container": {
      maxWidth: "100%",
    },
  },
}));

/**
 * The admin page.
 */
function AdminPage() {
  const [formData, setFormData] = useState({
    company: "",
    adminName: "",
    adminEmail: "",
    phone: "",
    planType: "Gold",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Root
      header={
        <div className="flex flex-col w-full">
          <Typography variant="h4" className="text-center py-16">
            Admin Dashboard
          </Typography>
        </div>
      }
      content={
        <div className="flex flex-col w-full max-w-6xl mx-auto p-24 sm:p-32">
          {/* Input Fields Section */}
          <div className="flex flex-col space-y-24 w-full">
            {/* Company Row */}
            <TextField
              label="Company"
              variant="outlined"
              fullWidth
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Enter company name"
            />

            {/* Admin Name, Email Row */}
            <div className="flex flex-row space-x-24">
              <TextField
                label="Admin Name"
                variant="outlined"
                fullWidth
                value={formData.adminName}
                onChange={(e) => handleInputChange("adminName", e.target.value)}
                placeholder="Enter admin name"
              />
              <TextField
                label="Admin Email"
                variant="outlined"
                fullWidth
                value={formData.adminEmail}
                onChange={(e) =>
                  handleInputChange("adminEmail", e.target.value)
                }
                placeholder="Enter admin email"
              />
            </div>

            {/* Phone and Plan Type Row */}
            <div className="flex flex-row space-x-24">
              <TextField
                label="Phone"
                variant="outlined"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
              <div className="flex flex-row items-center space-x-12">
                <TextField
                  label="Plan Type"
                  variant="outlined"
                  fullWidth
                  value={formData.planType}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => console.log("Change Plan button clicked")}
                >
                  Change Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Section-wise User Management */}
          <div className="flex flex-col space-y-16 mt-32">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex flex-row space-x-24 items-center"
              >
                <TextField
                  label={`Name ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter name"
                />
                <TextField
                  label={`Email ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter email"
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() =>
                    console.log(`Invite button clicked for row ${index + 1}`)
                  }
                >
                  Invite
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    console.log(`Remove button clicked for row ${index + 1}`)
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      }
      scroll="normal"
    />
  );
}

export default AdminPage;
