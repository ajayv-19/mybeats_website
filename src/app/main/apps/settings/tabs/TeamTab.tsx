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
import { getTeamMembers } from "../apis/Teamapis";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchAccountDetails, selectAccount } from "src/app/features/account/accountSlice";

const roles = [
  {
    label: "Read",
    value: "read",
    description:
      "Can read and clone this repository. Can also open and comment on issues and pull requests.",
  },
  {
    label: "Write",
    value: "write",
    description:
      "Can read, clone, and push to this repository. Can also manage issues and pull requests.",
  },
  {
    label: "Admin",
    value: "admin",
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

  const accountData = useSelector(selectAccount);
  console.log("accountData", accountData);
  const [data, setData] = useState<ApiResponse | null>(null);
  console.log("accountData", accountData);
  useEffect(() => {
    dispatch(fetchAccountDetails() as any);
  }, [dispatch])
  
  useEffect(() => {
  getTeamMembers(accountData?.company?.id, accountData?.user?.id).then((response) => {
    console.log("response", response);
    setData(response.data);
  });
  }, [])
  console.log("data", data);

  // Transform API data to match component's expected format
  const teamMembers = data?.invitedUsers?.map((user) => ({
    email: user.email,
    name: user.userDetails?.Customer_Name || user.email,
    avatar: user.userDetails?.image || "",
    role: user.userDetails?.usertype?.toLowerCase() || "read",
  }));

  const handleRemoveMember = (email: string) => {
    if (teamMembers) {
      updateTeamMembers(teamMembers.filter((member) => member.email !== email));
    }
  };

  // Convert role_id to role string for Select component
  const getRoleLabel = (usertype: string) => {
    switch (usertype?.toUpperCase()) {
      case "ADMIN":
        return "admin";
      case "WRITE":
        return "write";
      default:
        return "read";
    }
  };

  return (
    <div>
      <TextField
        className="w-full mb-24"
        label="Add team member"
        placeholder="Enter email"
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
              <IconButton>
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
                <Avatar src={member.avatar} alt={`Avatar °${member.name}`} />
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
                  size="small"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <IconButton onClick={() => handleRemoveMember(member.email)}>
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