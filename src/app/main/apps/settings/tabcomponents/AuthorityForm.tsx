import { Button, Typography } from "@mui/material";

interface AuthorityFormProps {
  authorizeUser: (isAuthorized: boolean) => void;
  emailForm?: boolean;
  setEmailForm?: (value: boolean) => void;
}

function AuthorityForm({ authorizeUser, setEmailForm }: AuthorityFormProps) {
  const handleCancelClick = () => {
    setEmailForm?.(true); // Show email form
    authorizeUser(false); // Prevent authorized access
  };

  return (
    <div className="flex flex-col gap-32 mt-20">
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
        <Button variant="outlined" onClick={handleCancelClick}>
          No
        </Button>
      </div>
    </div>
  );
}

export default AuthorityForm;