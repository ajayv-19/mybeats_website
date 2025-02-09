import { Button, Typography } from "@mui/material";

// Define the interface for the Authority Form Props
interface AuthorityFormProps {
  authorizeUser: (isAuthorized: boolean) => void; // Function to authorize the user to show the user company form
}

function AuthorityForm({ authorizeUser }: AuthorityFormProps) {
  return (
    <div className="flex flex-col gap-32">
      <Typography>
        Do you have the authority to register your insurance company and
        purchase the subscription plan?
      </Typography>

      <div className="flex gap-10">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => authorizeUser(true)}
        >
          Yes
        </Button>
        <Button variant="outlined" onClick={() => authorizeUser(false)}>
          No
        </Button>
      </div>
    </div>
  );
}

export default AuthorityForm;
