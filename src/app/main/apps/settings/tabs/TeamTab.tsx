import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  useGetTeamMembersSettingsQuery,
  useUpdateTeamMemberSettingsMutation,
} from "../SettingsApi";
import { useEffect, useState } from "react";
import { deleteQuickSightUser, getTeamMembers, inviteTeamMembers, removeTeamMembers, updateUserPermission } from "../apis/Teamapis";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { fetchAccountDetails, selectAccount } from "src/app/features/account/accountSlice";
import { log } from "console";
import { ChangeEventHandler } from "preact/compat";
import { has, set } from "lodash";
import FuseLoading from "@fuse/core/FuseLoading";
import SendIcon from '@mui/icons-material/Send';
import { toast } from "sonner";

const roles = [
  {
    label: "Reader",
    value: 2,
    description:
      "Can read and clone this repository. Can also open and comment on issues and pull requests.",
  },
  {
    label: "Admin",
    value: 1,
    description:
      "Can read, clone, and push to this repository. Can also manage issues, pull requests, and repository settings, including adding collaborators.",
  },
  {
    label: "Invite-Pending",
    value: 0,
    description:
      "Can read, clone, and push to this repository. Can also manage issues, pull requests, and repository settings, including adding collaborators.",
  },
];

// Add interface for the API response
interface UserDetails {
  Customer_Name: string;
  email: string;
  role_id: number;
  image: string;
  usertype: string;
}

interface InvitedUser {
  id: number;
  email: string;
  invitedBy: number;
  company_id: number;
  is_accepted: boolean;
  invited_at: string;
  userDetails: UserDetails | null;
}

interface ApiResponse {
  success: boolean;
  invitedUsers: InvitedUser[];
  message: string;
}

function TeamTab() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState('');
  const accountData = useSelector(selectAccount) as unknown as {
    plan: any;
   user: {
    id: any; email: string; role_id: number 
}; company: {
    id: any; license_used: number 
} 
};
  const [loading, setLoading] = useState(false); // Add loading state
  const ALLOWED_DOMAIN = accountData?.user?.email.split('@')[1];
  
  const licenseUsed = accountData?.company?.license_used || 0;
  const teamSize = accountData?.plan?.team_size || 0;
  const isInputDisabled = licenseUsed >= teamSize;

  console.log("accountData", accountData);
  const [data, setData] = useState<ApiResponse | null>({ success: false, invitedUsers: [], message: "" });
  console.log("accountData", accountData);

  // Fetch account details only once when the component mounts
  // useEffect(() => {

  //   dispatch(fetchAccountDetails() as any);

  // }, [dispatch]);

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true); // Start loading
      try {
        await dispatch(fetchAccountDetails() as any);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchAccount();
  }, [dispatch]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    // Check if email belongs to allowed domain
    const domain = email.split('@')[1];
    if (domain.toLowerCase() !== ALLOWED_DOMAIN.toLowerCase()) {
      return `Only ${ALLOWED_DOMAIN} email addresses are allowed`;
    }

    return '';
  };



  const fetchData = async () => {
    if (accountData?.company?.id && accountData?.user?.id) {
      try {
        setLoading(true); // Start loading
        const response = await getTeamMembers(accountData?.company?.id, accountData?.user?.id);
        if (response.status !== 200) {
          setData(response.data);
        }
        setData(response.data);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }finally {
        setLoading(false); // Stop loading
      }
    } else {
      console.log("No data");
    }
  };

  // Fetch team members when accountData changes
  useEffect(() => {
    fetchData();
  }, [accountData]);

  // Transform API data to match component's expected format and filter out the logged-in user
  const teamMembers = data?.invitedUsers
    ?.filter((user) => user.email !== accountData?.user?.email) // Filter out the logged-in user
    .map((user) => ({
      email: user.email,
      name: user.userDetails?.Customer_Name || user.email,
      avatar: user.userDetails?.image || "",
      role: user.userDetails?.role_id || 0,
    }));

  console.log("teamMembers", {teamMembers,accountData});

  const handleRemoveMember = async (email: string) => {
    
    if (teamMembers) {
      let hasError = false;
      setLoading(true);
      try {
        const response = await removeTeamMembers(email);
        if (!response) {
          toast.error("Failed to remove member");
          hasError = true;
        }
        if (response.status === 200) {
          await fetchData(); // Update team members state
          dispatch(fetchAccountDetails()); // Fetch updated license_used
        }
      } catch (error) {
        console.log("Failed to remove member", error);
        if (!hasError) {
          toast.error("Failed to remove member");
          hasError = true;
        }
      }finally {
        setLoading(false); // Stop loading
      }

      try {
        await deleteQuickSightUser(email);
      } catch (error) {
        // if (!hasError) {
        //   alert("Failed to remove member");
        //   hasError = true;
        // }
      }
      console.log("Remove member", email);
    }
  };

  const handleInviteMember = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value as string));
  }

  const handleAddMember = async () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    if (teamMembers?.some((member) => member.email === email)) {
      setEmailError("User is already invited");
      return;
    }
    setLoading(true);
    try {
      const response = await inviteTeamMembers(email);
      if (!response || response.status !== 200) {
       toast.error("Failed to invite user");
        return;
      }
      if (response.status === 200) {
        await fetchData();
        dispatch(fetchAccountDetails());
        setEmail("");
        setEmailError("");
      }
    } catch (error) {
      setEmailError("Failed to invite user");
    }finally {
      setLoading(false); // Stop loading
    }
    console.log("Add member clicked", email);
  };

  const handleRoleChange = async (email: string, newRole: number) => {
    console.log("email", email, "newRole", newRole);
    const role = newRole === 1 ? "ADMIN" : newRole === 2 ? "READER" : "READER";
    try {
      const response = await updateUserPermission(email, role);
      console.log("response------>", response);
      
      if (!response || response.status !== 200) {
        toast.error("Failed to update user role");
        return;
      }
      if (response.status === 200) {
        fetchData();
      }
    } catch (error) {

      toast.error("Failed to update user role");
      console.error("Failed to update user role:", error);
    }
  };

  console.log("teamMembers", teamMembers);

  const isUserAdmin = accountData?.user?.role_id === 1;
  //raplace with actual isUserAdmin check


  return loading ? <FuseLoading/> :(
    <div>
      <TextField
        value={email}
        onChange={handleInviteMember}
        className="w-full mb-24"
        label="Add team member"
        placeholder={`Enter email (example@${ALLOWED_DOMAIN})`}
        error={!!emailError}
        helperText={emailError}
        InputLabelProps={{
          shrink: true,
        }}
        disabled={!isUserAdmin|| isInputDisabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={20}>heroicons-outline:user</FuseSvgIcon>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleAddMember}
              disabled={!isUserAdmin || isInputDisabled}
              >
              <SendIcon color={!isUserAdmin || isInputDisabled ? "disabled" : "primary"} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            ...(isInputDisabled && {
              backgroundColor: "#f5f5f5", // Light gray background when disabled
              "& fieldset": {
                borderColor: "red", // Red border when disabled
              },
            }),
          },
        }}

      />
<Typography variant="h6" className="mb-16">
  Team Size: {accountData?.company?.license_used || 0}/{accountData?.plan?.team_size || 0}
  {isInputDisabled && (
    <span style={{ color: "red", marginLeft: "8px" }}> (Invite limit is reached)</span>
  )}
</Typography>
      <Divider />
      {(!teamMembers || teamMembers.length === 0) && (
        <Typography className="text-center my-32" color="textSecondary">
          No team members found.
        </Typography>
      )}
      <List>
        {teamMembers?.map((member) => (
          <ListItem
            divider
            key={member.email}
            disablePadding
            className="py-12 flex flex-col items-start sm:items-center sm:flex-row space-y-16 sm:space-y-0"
          >
            <div className="flex flex-1 items-center">
              <ListItemAvatar>
                <Avatar src={member.avatar} alt={`Avatar ${member.name}`} />
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                secondary={member.email}
                classes={{ secondary: "truncate" }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <Select
                  // sx={{
                  //   "& .MuiSelect-select": {
                  //     minHeight: "0!important",
                  //   },
                  // }}
                  sx={{
                    "& .MuiSelect-select": {
                      minHeight: "0!important",
                      backgroundColor: member.role === 0 ? "#f5f5f5" : "inherit", // Light gray background when disabled
                      color: member.role === 0 ? "gray" : "inherit", // Gray text when disabled
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: member.role === 0 ? "red" : "inherit", // Red border when disabled
                    },
                  }}
                  value={member.role}
                  disabled={member.role === 0}
                  size="small"
                  onChange={(e) => handleRoleChange(member.email, e.target.value as number)}
                >
                  {member.role === 0 ? (
                    <MenuItem value={0}>Invite-Pending</MenuItem>
                  ) : (
                    roles
                      .filter(role => role.value === 1 || role.value === 2)
                      .map((role) => (
                        <MenuItem key={role.value} value={role.value} disabled={!isUserAdmin}>
                          {role.label}
                        </MenuItem>
                      ))
                  )}
                </Select>
              </div>
              <IconButton disabled={!isUserAdmin} onClick={() => handleRemoveMember(member.email)} >
                <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
              </IconButton>
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default TeamTab;