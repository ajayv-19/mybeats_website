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
import { fetchAccountDetails, selectAccount } from "src/app/features/account/accountSlice";
import { log } from "console";
import { ChangeEventHandler } from "preact/compat";
import { set } from "lodash";

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
    label: "Not-Defined",
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
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState('');
  const accountData = useSelector(selectAccount);
  const ALLOWED_DOMAIN = accountData?.user?.email.split('@')[1];

  console.log("accountData", accountData);
  const [data, setData] = useState<ApiResponse | null>({ success: false, invitedUsers: [], message: "" });
  console.log("accountData", accountData);
  useEffect(() => {
    dispatch(fetchAccountDetails() as any);
  }, [dispatch])

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

  const fetchData = () => {
    if (accountData?.company?.id && accountData?.user?.id) {
      getTeamMembers(accountData?.company?.id, accountData?.user?.id).then((response) => {
        console.log("response", response);
        setData(response.data);
      });
    } else {
      console.log("No data");
    }
  };

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

  console.log("teamMembers", teamMembers);

  const handleRemoveMember = (email: string) => {
    if (teamMembers) {
      removeTeamMembers(email).then((response) => {
        if (response.status === 200) {
          fetchData();
        }
      });
      deleteQuickSightUser(email);
      console.log("Remove member", email);
      //updateTeamMembers(teamMembers.filter((member) => member.email !== email));
    }
  };

  const handleInviteMember = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value as string));
  }

  const handleAddMember = () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    if (teamMembers?.some((member) => member.email === email)) {
      setEmailError("User is already invited");
      return;
    }

    inviteTeamMembers(email).then((response) => {
      if (response.status === 200) {
        fetchData();
        setEmail("");
        setEmailError("");
      }
    }).catch((error) => {
      setEmailError("Failed to invite user");
    });
    console.log("Add member clicked", email);
  }

  const handleRoleChange = (email: string, newRole: number) => {
    // Call API to update team member role
    console.log("email", email, "newRole", newRole);
    const role = newRole === 1 ? "ADMIN" : newRole === 2 ? "READER" : "READER";
    updateUserPermission(email, role).then((response) => {
      if (response.status === 200) {
        fetchData();
      }
    });
  };

  console.log("teamMembers", teamMembers);

  return (
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={20}>heroicons-outline:user</FuseSvgIcon>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleAddMember}>
                <FuseSvgIcon size={20}>
                  heroicons-outline:plus-circle
                </FuseSvgIcon>
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
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
                  sx={{
                    "& .MuiSelect-select": {
                      minHeight: "0!important",
                    },
                  }}
                  value={member.role}
                  disabled={member.role === 0}
                  size="small"
                  onChange={(e) => handleRoleChange(member.email, e.target.value as number)}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <IconButton onClick={() => handleRemoveMember(member.email)} >
              {/* disabled={member?.role_id === 1} */}
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