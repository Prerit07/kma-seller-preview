"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import {
  userProfileApiHandler,
  UserProfileResponse,
  userProfileUpdateApiHandler,
  UserProfileUpdatePayload,
  UserProfileUpdateResponse,
  ValidateChannelPartnerCodeApiHandler,
  ValidateChannelPartnerCodePayload,
  ValidateChannelPartnerCodeResponse,
  validateEmailApiHandler,
  ValidateEmailPayload,
  ValidateEmailResponse,
} from "@/services/userService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { OptionType } from "../common/select";
import { MultiValue } from "react-select";
import { useCitySearch } from "@/api/hooks/useCitySearch";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setFormData, setFormField } from "@/store/createAccountSlice";
import {
  getFileUploadUrlApiHandler,
  GetFileUploadUrlPayload,
  GetFileUploadUrlResponse,
  uploadFileToS3ApiHandler,
  UploadFileToS3Payload,
  UploadFileToS3Response,
} from "@/services/masterService";
import { toast } from "react-toastify";
import { InputBase } from "@mui/material";
import DynamicAsyncAutocomplete from "../common/dynamicAsyncSelectMui";
import ImageUpload from "../common/upload";
import { USER_TYPE } from "@/lib/enums";
import Spinner from "../common/spinner";
import FullscreenSpinner from "../common/spinner/fullScreenSpinner";

interface FormData {
  fullName: string;
  email: string;
  partnerCode: string;
  city: OptionType | MultiValue<OptionType> | null;
  businessSince: string;
  firmName: string;
  about: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ProfileUpdate({ open, onClose }) {
  const queryClient = useQueryClient();
  const { loadCities } = useCitySearch();
  const baseUrl = process.env.NEXT_PUBLIC_AWS_URL;
  const theme = useTheme();
  const dateRef = React.useRef<HTMLInputElement | null>(null);
  const searchRef = React.useRef(null);
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const formData = useSelector((state: RootState) => state.form);
  const dispatch = useDispatch();
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [codeError, setCodeError] = React.useState(false);
  const [emailError, setEmailError] = React.useState(false);
  const handleChange = React.useCallback(
    (field: keyof FormData, value: string) => {
      dispatch(setFormField({ key: field, value }));
      if (field != "partnerCode") {
        setFormErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    []
  );

  const handleUpload = (uploadedFile) => {
    dispatch(setFormField({ key: "profilePhoto", value: uploadedFile }));
    dispatch(
      setFormField({
        key: "profilePreview",
        value: URL.createObjectURL(uploadedFile),
      })
    );
  };

  const { mutate: validateEmailAddress } = useMutation({
    mutationFn: async (
      payload: ValidateEmailPayload
    ): Promise<ValidateEmailResponse> => {
      return await validateEmailApiHandler(payload);
    },
    onSuccess: (response: ValidateEmailResponse) => {
      if (response?.success) {
        setFormErrors((pre) => ({ ...pre, email: "" }));
        setEmailError(false);
      } else {
        setFormErrors((pre) => ({ ...pre, email: response.message }));
        setEmailError(true);
      }
    },
    onError: (error: any) => {
      if (error?.success) {
        setFormErrors((pre) => ({ ...pre, email: "" }));
        setEmailError(false);
      } else {
        setFormErrors((pre) => ({ ...pre, email: error.message }));
        setEmailError(true);
      }
    },
  });

  const { mutate: validateChannelParnterCode } = useMutation({
    mutationFn: async (
      payload: ValidateChannelPartnerCodePayload
    ): Promise<ValidateChannelPartnerCodeResponse> => {
      return await ValidateChannelPartnerCodeApiHandler(payload);
    },
    onSuccess: (response: ValidateChannelPartnerCodeResponse) => {
      if (response?.valid) {
        setFormErrors((pre) => ({ ...pre, partnerCode: "" }));
        setCodeError(false);
      } else {
        setFormErrors((pre) => ({ ...pre, partnerCode: response.message }));
        setCodeError(true);
      }
    },
    onError: (error: any) => {
    },
  });

  const { mutate: handleFileUpload, isPending: fileUrlLoader } = useMutation({
    mutationFn: async (
      payload: UploadFileToS3Payload
    ): Promise<UploadFileToS3Response> => {
      return await uploadFileToS3ApiHandler(payload);
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const { mutate: handleGetFileUrl, isPending: fileLoader } = useMutation({
    mutationFn: async (
      payload: GetFileUploadUrlPayload
    ): Promise<GetFileUploadUrlResponse> => {
      return await getFileUploadUrlApiHandler(payload);
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const { mutate: handleSubmitUser, isPending: userloader } = useMutation({
    mutationFn: async (
      payload: UserProfileUpdatePayload
    ): Promise<UserProfileUpdateResponse> => {
      return await userProfileUpdateApiHandler(payload);
    },
    onSuccess: (response) => {
        toast.success('Profile Updated Successfully')
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-dashboard-details"] });
        onClose(true)
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
  };

  const { data: userProfile, isLoading: profielLoader } = useQuery({
    queryKey: ["user-profile-1"],
    queryFn: async (): Promise<UserProfileResponse> => {
      return userProfileApiHandler();
    },
    select: (resposne: UserProfileResponse) => {
      return resposne.user;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const validateStep = () => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    // Email is optional. Only validate format if the user typed something.
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (userProfile.role == USER_TYPE.OWNER) {
      if (!formData.city) {
        errors.city = "City is required";
      }
    }

    if (userProfile.role == USER_TYPE.CHANNEL_PARTNER) {
      if (!formData.partnerCode.trim()) {
        errors.partnerCode = "Partner code is required";
      }

      if (formData.partnerCode.trim() && formData.partnerCode.length < 3) {
        errors.partnerCode = "Partner code must be between 3 and 50 characters";
      }

      if (
        (Array.isArray(formData.city) && formData.city.length === 0) ||
        !formData.city
      ) {
        errors.city = "City is required";
      }

      if (!formData.businessSince) {
        errors.businessSince = "Business since is required";
      }

      if (!formData.firmName.trim()) {
        errors.firmName = "Firm name is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (userProfile.role == USER_TYPE.OWNER) {
      if (validateStep()) {
        if (emailError) {
          return;
        }

        let payload: any = {
          name: formData.fullName,
          ...(formData.email?.trim() ? { email: formData.email.trim() } : {}),
          city: formData.city?.label ?? "",
        };

        if (formData.profilePhoto) {
          handleGetFileUrl(
            {
              contentType: formData.profilePhoto.type,
              filename: formData.profilePhoto.name,
              expiresIn: 3600,
              folder: process.env.NEXT_PUBLIC_AWS_FOLDER,
            },
            {
              onSuccess: (response: GetFileUploadUrlResponse) => {
                if (response.success) {
                  handleFileUpload(
                    { url: response.data.url, file: formData.profilePhoto },
                    {
                      onSuccess: () => {
                        payload = {
                          ...payload,
                          profileImage: response.data.key,
                        };
                        handleSubmitUser(payload);
                      },
                    }
                  );
                } else {
                  toast.error(
                    `Failed to get upload URL for ${formData.profilePhoto.name}`
                  );
                }
              },
            }
          );
        } else {
          handleSubmitUser(payload);
        }
      }
    }
    if(userProfile.role == USER_TYPE.CHANNEL_PARTNER){
        if(validateStep()){
            if(codeError){
                return
            }
            if(emailError){
                return
            }
            let payload: any = {
                name: formData.fullName,
                ...(formData.email?.trim() ? { email: formData.email.trim() } : {}),
                channelPartnerCode: formData.partnerCode,
                firmName: formData.firmName,
                businessSince: formData.businessSince,
                cities: Array.isArray(formData.city)
                ? formData.city.map((item) => item.label).join(",")
                : "",
                aboutYourSelf: formData.about,
            };

            if(formData.profilePhoto){
                handleGetFileUrl(
            {
                contentType: formData.profilePhoto.type,
                filename: formData.profilePhoto.name,
                expiresIn: 3600,
                folder: process.env.NEXT_PUBLIC_AWS_FOLDER,
            },
            {
                onSuccess: (response: GetFileUploadUrlResponse) => {
                if (response.success) {
                    handleFileUpload(
                    { url: response.data.url, file: formData.profilePhoto },
                    {
                        onSuccess: () => {
                        payload = {...payload, profileImage: response.data.key}
                        handleSubmitUser(payload)
                        },
                    }
                    );
                } else {
                    toast.error(`Failed to get upload URL for ${formData.profilePhoto.name}`);
                }
                },
            }
            );
            }else{
                handleSubmitUser(payload);
            }
        }
    }
  };

  React.useEffect(() => {
    if (userProfile) {
      let city: any = "";
      if (userProfile.role == USER_TYPE.CHANNEL_PARTNER) {
        city = userProfile.cities;
        city = city.split(",").map((item) => {
          return { value: item, label: item };
        });
      } else {
        city = userProfile.city;
        city = { value: city, label: city };
      }

      let data = {
        fullName: userProfile?.name,
        email: userProfile?.email,
        partnerCode: userProfile?.channelPartnerCode,
        city: city,
        businessSince: userProfile?.businessSince,
        firmName: userProfile?.firmName,
        about: userProfile?.aboutYourSelf,
        profilePreview: userProfile?.profileImage
          ? baseUrl + userProfile.profileImage
          : "",
        profilePhoto: null,
      };
      dispatch(setFormData(data));
    }
  }, [userProfile]);

  const dynamicClass = (flag: string) => {
    return `
      box-border h-[47.81px] px-4 py-2 text-sm rounded-full 
      border focus:outline-none
      ${
        Boolean(flag)
          ? "border-red-500 focus:border-red-500"
          : "border-border focus:border-blue"
      }
      text-text-gray
    `;
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={() => onClose(false)}
        aria-labelledby="responsive-dialog-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: fullScreen ? "" : "1rem",
            },
          },
        }}
      >
        <DialogContent>
          {profielLoader ? <FullscreenSpinner /> : <>
          
          <div>
            <div className="flex justify-end w-full">
              <Image
                onClick={() => {
                  onClose(false);
                }}
                src="/assets/close-icon.svg"
                alt="close"
                width={24}
                height={24}
                className="cursor-pointer"
              />
            </div>
            <div className="flex flex-col items-start gap-4 xl:gap-6 w-full md:w-[552px] p-1">
              <p className="text-lg text-text-black font-semibold">
                Edit Your Information
              </p>
              <div className="flex flex-col gap-3 w-full">
                <>
                  <p className="required-label text-sm 1xl:text-base text-text-black">
                    Full Name
                  </p>
                  <div>
                    <InputBase
                      placeholder="Enter your full name"
                      fullWidth
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      value={formData.fullName}
                      className={dynamicClass(formErrors.fullName)}
                      inputProps={{
                        className: "placeholder-gray",
                      }}
                    />
                    {formErrors.fullName && (
                      <p className="pt-1 text-red-500 text-xs">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>
                  <p className="required-label text-sm 1xl:text-base text-text-black">
                    Email Address
                  </p>
                  <div>
                    <InputBase
                      placeholder="Enter your email"
                      fullWidth
                      value={formData.email}
                      onChange={(e) => {
                        handleChange("email", e.target.value);
                        clearTimeout(searchRef.current);
                        searchRef.current = setTimeout(() => {
                          validateEmailAddress({ email: e.target.value });
                        }, 300);
                      }}
                      className={dynamicClass(formErrors.email)}
                      inputProps={{
                        className: "placeholder-gray",
                      }}
                    />
                    {formErrors.email && (
                      <p className="pt-1 text-red-500 text-xs">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <>
                    <p className="required-label text-sm 1xl:text-base text-text-black">
                      City
                    </p>
                    <div>
                      <DynamicAsyncAutocomplete
                        isMulti={
                          userProfile?.role == USER_TYPE.CHANNEL_PARTNER
                            ? true
                            : false
                        }
                        isError={false}
                        placeholder={"Search city"}
                        onChange={(value: OptionType) => {
                          dispatch(setFormField({ key: "city", value }));
                          setFormErrors({ ...formErrors, city: "" });
                        }}
                        loadOptions={loadCities}
                        value={formData.city}
                        minHeight={"47px"}
                      />
                      {formErrors.city && (
                        <p className="pt-1 text-red-500 text-xs">
                          {formErrors.city}
                        </p>
                      )}
                    </div>
                  </>

                  <div>
                    <p className="text-sm 1xl:text-base text-text-black">
                      Profile Photo
                    </p>
                    <div className="pt-2">
                      <ImageUpload
                        onUpload={(file) => {
                          handleUpload(file[0]);
                        }}
                        type="photo"
                        accept={"image/jpeg, image/jpg, image/png"}
                        label="Drag and drop file here"
                        subLabel="Max. size 20 MB • Formats: PNG, JPG, JPEG"
                      />
                    </div>
                    {formData.profilePreview && (
                      <div className="mt-2">
                        <img
                          src={formData.profilePreview ?? ""}
                          alt="Preview"
                          className="w-30 h-30 object-cover rounded-xl border"
                        />
                      </div>
                    )}
                  </div>
                </>

                <>
                  {userProfile?.role == USER_TYPE.CHANNEL_PARTNER && (
                    <>
                      <p className="required-label text-sm 1xl:text-base text-text-black">
                        Channel Partner Code
                      </p>
                      <div>
                        <InputBase
                          placeholder="Enter code"
                          fullWidth
                          value={formData.partnerCode}
                          onChange={(e) => {
                            if (e.target.value && e.target.value.length > 50)
                              return;
                            handleChange("partnerCode", e.target.value);
                            if (e.target.value && e.target.value.length >= 3) {
                              validateChannelParnterCode({
                                code: e.target.value,
                              });
                            }
                          }}
                          className={dynamicClass(formErrors.partnerCode)}
                          inputProps={{
                            className: "placeholder-gray",
                          }}
                        />
                        {formErrors.partnerCode && (
                          <p className="pt-1 text-red-500 text-xs">
                            {formErrors.partnerCode}
                          </p>
                        )}
                      </div>

                      <p className="required-label text-sm 1xl:text-base text-text-black">
                        In Bussiness Since
                      </p>
                      <div
                        onClick={() => {
                          dateRef.current?.showPicker();
                        }}
                      >
                        <InputBase
                          inputRef={dateRef}
                          placeholder="Selct"
                          type="date"
                          fullWidth
                          onChange={(e) =>
                            handleChange("businessSince", e.target.value)
                          }
                          value={formData.businessSince}
                          className={dynamicClass(formErrors.businessSince)}
                          inputProps={{
                            className: "placeholder-gray",
                            max: new Date().toISOString().split("T")[0],
                          }}
                        />
                        {formErrors.businessSince && (
                          <p className="pt-1 text-red-500 text-xs">
                            {formErrors.businessSince}
                          </p>
                        )}
                      </div>
                      <p className="required-label text-sm 1xl:text-base text-text-black">
                        Firm Name
                      </p>
                      <div>
                        <InputBase
                          placeholder="Enter firm name"
                          fullWidth
                          value={formData.firmName}
                          onChange={(e) =>
                            handleChange("firmName", e.target.value)
                          }
                          className={dynamicClass(formErrors.firmName)}
                          inputProps={{
                            className: "placeholder-gray",
                          }}
                        />
                        {formErrors.firmName && (
                          <p className="pt-1 text-red-500 text-xs">
                            {formErrors.firmName}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-sm 1xl:text-base text-text-black">
                    About Your Self
                  </p>
                  <InputBase
                    placeholder="Description..."
                    multiline
                    fullWidth
                    minRows={4}
                    value={formData.about}
                    onChange={(e) => handleChange("about", e.target.value)}
                    className="box-border text-sm text-text-gray rounded-xl border border-border focus:outline-none focus:border-blue"
                    sx={{
                      "& .MuiInputBase-input": {
                        padding: "1rem",
                      },
                    }}
                  />
                    </>
                  )}
                  
                </>
              </div>
            </div>
            <div className="w-full flex justify-end">
             <button
              disabled={userloader || fileLoader || fileUrlLoader}
              onClick={handleSubmit}
              className="w-full mt-3 md:w-auto text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
            >
              <span className="gap-3 relative">
                {!(userloader || fileLoader || fileUrlLoader) ? (
                    <p className="text-nowrap">
                    Update
                  </p>
                  ) : (
                    <Spinner size={20} className="h-[24px]"/>
                  )}
                
              </span>
            </button>
            </div>
          </div>
          </>}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
