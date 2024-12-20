import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import _ from "lodash";
import {
  SettingsAccount,
  useGetAccountSettingsQuery,
  useUpdateAccountSettingsMutation,
} from "../SettingsApi";
import { checkUserExist } from "../../profile/ProfileApis/checkUserApi";
import { fetchProfileData } from "src/app/backendServices/ProfileServices";
import { addOrUpdateUser } from "../apis/Accountapis";
import { fetchAuthSession } from "@aws-amplify/auth";
import { uploadData, downloadData } from "aws-amplify/storage";

// Utility to convert Blob to Base64
const convertBlobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });

// Fetch default email
const fetchDefaultEmail = async () => {
  const data = await fetchAuthSession();
  console.log(data);

  const defaultemail: string = data.tokens.idToken.payload.email
    ? String(data.tokens.idToken.payload.email)
    : "default@example.com";
  console.log(defaultemail, "defaultemail");

  return defaultemail;
};

// Form validation schema
const schema = z.object({
  email: z.string().email("Invalid email"),
  Customer_Name: z.string().nonempty("Customer name is required"),
});

// Form type
type FormType = {
  email: string;
  Company_Name: string;
  Customer_Name: string;
  domain: string;
  website: string;
  adminEmail: string;
  image: string;
};

// Default form values
const defaultValues: FormType = {
  email: "",
  Company_Name: "",
  Customer_Name: "",
  domain: "",
  website: "",
  adminEmail: "",
  image: "",
};

function AccountTab() {
  const [updateAccountSettings] = useUpdateAccountSettingsMutation();
  const [isUserExists, setIsUserExists] = useState(false);
  const [user, setUser] = useState<FormType>(defaultValues);
  const [profileImage, setProfileImage] = useState(
    "assets/images/avatars/male-04.jpg"
  );
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [defaultemail, setDefaultEmail] = useState<string>("");
  const [profileImageLink, setProfileLinkImage] = useState(null);

  const { control, reset, handleSubmit, formState } = useForm<FormType>({
    mode: "all",
    resolver: zodResolver(schema),
  });
  console.log("formState", formState);
  console.log("isvalid", formState.isValid);

  const { isValid, dirtyFields, errors } = formState;

  console.log(isValid, dirtyFields, errors, "isValid, dirtyFields, errors");

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const getUserData = await fetchProfileData();
      console.log(getUserData, "getUserData");

      if (getUserData.status === 200) {
        const userData = getUserData.data.userdata.user;
        setProfileImage(userData.image);
        setUser(userData);
        reset(userData);
        console.log(userData, "userData");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const email = await fetchDefaultEmail();
      setDefaultEmail(email);
      setUser((prevUser) => ({ ...prevUser, email }));
      fetchUserData();
    };

    initialize();
  }, []);

  useEffect(() => {
    checkUserExist()
      .then((res) => {
        console.log(res, "res");
        if (res.status === 200) {
          setIsUserExists(true);
        } else {
          setIsUserExists(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  console.log(profileImageLink, "profile result");
  // Form submit handler
  const onSubmit = async (formData: FormType) => {
    try {
      console.log(formData, "formData");
      let linkFromS3;
      if (profileImageLink) {
        const result = await uploadImageToS3(profileImageLink);
        console.log(result, "result");

        linkFromS3 = `https://insurance-dashboard-imagesdd445-dev.s3.us-east-1.amazonaws.com/public/${result.key}`;
        formData = { ...formData, image: linkFromS3 };
      }
      const res = await addOrUpdateUser(formData);
      if (res.status === 200) {
        fetchUserData();
      }
      console.log(res, "res");
    } catch (error) {
      console.error("Failed to update account settings:", error);
    }
  };

  // Upload Image to S3 using uploadData
  const uploadImageToS3 = async (file: File): Promise<any> => {
    try {
      // Remove '.' and '@' from the email
      const sanitizedEmail = defaultemail.replace(/[.@]/g, ""); // Replace dots and '@' with an empty string

      // Extract the file extension from the file name
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")); // Includes the dot (e.g., ".jpg")

      // Concatenate sanitized email and file extension
      const fileName = `profiles/${sanitizedEmail}${fileExtension}`;

      console.log("Generated File Name:", fileName); // Debugging

      // Upload the file to S3
      const result = await uploadData({
        key: fileName,
        data: file,
        options: { level: "public" } as any,
      }).result;

      console.log("Image uploaded successfully:", result);

      // Fetch and convert the uploaded image to Base64
      const base64Image = await fetchProfileImageFromS3(fileName);
      console.log(base64Image, "base64Image");
      setProfileImage(base64Image); // Update the profile image
      return result;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
    }
  };

  // Fetch Profile Image from S3
  const fetchProfileImageFromS3 = async (
    key: string
  ): Promise<string | null> => {
    try {
      const downloadResult = await downloadData({ key }).result;
      const imageBlob = await downloadResult.body.blob();
      return await convertBlobToBase64(imageBlob);
    } catch (error) {
      console.error("Error fetching profile image:", error);
      return null;
    }
  };

  // Handle Cropped Image
  const getCroppedImage = async (): Promise<void> => {
    try {
      const canvas = document.createElement("canvas");
      const image = new Image();
      image.src = imageSrc!;
      await new Promise<void>((resolve) => (image.onload = () => resolve()));

      const { width, height } = croppedArea!;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        image,
        croppedArea!.x,
        croppedArea!.y,
        croppedArea!.width,
        croppedArea!.height,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `cropped-image.jpg`, {
            type: "image/jpeg",
          });
          setProfileImage(URL.createObjectURL(file));
          setProfileLinkImage(file);
          // Upload the cropped image
          setIsCropDialogOpen(false);
        }
      }, "image/jpeg");
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  // Handle Image Change
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageSrc(reader.result);
          setIsCropDialogOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  console.log("gte data", user);

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-4xl mx-auto rounded-xl p-6 md:p-8">
          {/* User Profile Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 justify-center rounded-lg relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, transition: { delay: 0.1 } }}
            >
              <Avatar
                sx={{ borderColor: "background.paper" }}
                className="w-128 h-128 border-4"
                src={profileImage}
                alt="User avatar"
                onClick={() => fileInputRef.current?.click()}
              />
            </motion.div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              aria-label="Upload profile picture"
            />
          </div>

          {/* Crop Dialog */}
          {isCropDialogOpen && (
            <Dialog
              open={isCropDialogOpen}
              onClose={() => setIsCropDialogOpen(false)}
              maxWidth="lg"
              fullWidth={true}
              sx={{
                "& .MuiDialog-paper": {
                  width: "80%",
                  height: "80%",
                  maxWidth: "none",
                },
              }}
            >
              <DialogContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  padding: "16px",
                }}
              >
                <div
                  className="crop-container"
                  style={{ width: "100%", height: "100%" }}
                >
                  <Cropper
                    image={imageSrc!}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(croppedArea, croppedAreaPixels) =>
                      setCroppedArea(croppedAreaPixels)
                    }
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsCropDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={getCroppedImage}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </div>

        <div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
          <div className="sm:col-span-4">
            <Controller
              control={control}
              name="Customer_Name"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:user
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="sm:col-span-4">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="Email"
                  disabled
                  variant="outlined"
                  fullWidth
                  value={field.value || user.email}
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
          <Button variant="outlined" onClick={() => reset(user)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={_.isEmpty(dirtyFields) || !isValid}
            type="submit"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AccountTab;
