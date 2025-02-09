import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import _ from "lodash";
import { useEffect, useState } from "react";
import { fetchDefaultEmail } from "src/utils/apis/userAuthApis";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAccountDetails,
  selectAccount,
  selectAccountLoading,
  submitAccountDetails,
} from "src/app/features/account/accountSlice";
import FuseLoading from "@fuse/core/FuseLoading";
import { SettingsAccount } from "../SettingsApi";
import AccountProfile from "../tabcomponents/AccountProfile";
import { useNavigate } from "react-router";

type FormType = SettingsAccount;

const defaultValues: FormType = {
  Customer_Name: "",
  email: "",
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  Customer_Name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email"),
});

function AccountTab() {
  const [profileImage, setProfileImage] = useState<string>("");
  const [imageAdded, setImageAdded] = useState<File | null>(null);
  const [emailFetched, setEmailFetched] = useState("");
  const [fullName, setFullName] = useState("");
  const { user } = useSelector(selectAccount);
  const loading = useSelector(selectAccountLoading);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { control, reset, handleSubmit, formState, setValue } =
    useForm<FormType>({
      defaultValues,
      mode: "all",
      resolver: zodResolver(schema),
    });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    const setDefaultEmail = async () => {
      try {
        const email = await fetchDefaultEmail();
        setValue("email", email);
        setEmailFetched(email);
      } catch (error) {
        console.error("Error setting default email:", error);
      }
    };
    setDefaultEmail();
  }, [setValue]);

  useEffect(() => {
    if (user) {
      setValue("Customer_Name", user.Customer_Name);
      setFullName(user.Customer_Name);
      setProfileImage(user.image);
    }
  }, [user]);

  /**
   * Form Submit
   */
  async function onSubmit(formData: FormType) {
    await dispatch(
      submitAccountDetails({
        formData,
        profileImageLink: imageAdded,
        defaultEmail: emailFetched,
      })
    );
    navigate("/apps/settings/company");
    await dispatch(fetchAccountDetails());
  }

  /**
   * Handle Reset
   */
  function handleReset() {
    reset({
      Customer_Name: user.Customer_Name ?? "",
      email: undefined, // Prevent email field from resetting to default
    });
    setImageAdded(profileImage); // Reset image state
  }

  if (loading)
    return (
      <div className="w-full h-full items-center justify-center flex">
        <FuseLoading />;
      </div>
    );

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <AccountProfile
          profileImage={profileImage}
          setProfileImage={setProfileImage}
          setImageFile={(file: File) => setImageAdded(file)} // Store the added image
        />

        <div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
          <div className="sm:col-span-4">
            <Controller
              control={control}
              name="Customer_Name"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  placeholder="Name"
                  id="name"
                  error={!!errors.Customer_Name}
                  helperText={errors?.Customer_Name?.message}
                  variant="outlined"
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:user-circle
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div>

        <div className="w-full gap-24 mt-32">
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="Email"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors?.email?.message}
                  disabled // Disable email field
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:envelope
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div>

        <Divider className="mb-40 mt-44 border-t" />
        <div className="flex items-center justify-end space-x-8">
          <Button
            variant="outlined"
            disabled={_.isEmpty(dirtyFields) && !imageAdded} // Ensure reset button is enabled if image is added
            onClick={handleReset} // Custom reset logic
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={(_.isEmpty(dirtyFields) || !isValid) && !imageAdded} // Enable Save if an image is added
            type="submit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AccountTab;
