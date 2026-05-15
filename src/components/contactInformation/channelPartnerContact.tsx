"use client";
import * as React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import MobileInput from "../common/mobileInput";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { mobileNumberValidator } from "@/lib/commonValidator";
import { InputBase } from "@mui/material";
import ContactOtp from "./contactOtp";
import { contactUsHomeOtpApiHandler, ContactUsHomeOtpPayload, ContactUsHOmeOtpResponse, submitHomeContactApiHandler, SubmitHomeContactPayload, SubmitHomeContactResponse } from "@/services/contactService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface MobileInput {
  value: string;
  validationMessage: string;
  code: string;
}

export default function ChannelPartnerContact({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [openContactPopup, setOpenContactPopup] = React.useState(false)
  const [openOptPopup, setOpenOtpPopup] = React.useState(false)

  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    mobile: { code: "+ 91", value: "" },
    email: "",
  });
  const [errors, setErrors] = React.useState<any>({});

  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setFormData({
      name: "",
      mobile: { code: "+ 91", value: "" },
      email: "",
    })
    setOpenContactPopup(false)
    onClose();
  };

  const handleChange = React.useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }, []);

  const handleMobileInputChange = (value: string, code: string) => {
    const msg = errors.phone ? mobileNumberValidator(value) : "";
    setFormData({ ...formData, mobile: { value: value, code: code } });
    setErrors({ ...errors, phone: msg });
  };

  const validate = (): boolean => {
      const newErrors: any = {};
  
      if (!formData.name.trim()) newErrors.name = "Name is required";
  
      if (formData.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      let msg = mobileNumberValidator(formData.mobile.value)
      if(msg){
        newErrors.mobile = msg
      }
  
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0;
    };

    const {
        mutate: submitEndUserContactDetails,
        isPending: enduserLoader,
      } = useMutation({
        mutationFn: async (payload: SubmitHomeContactPayload): Promise<SubmitHomeContactResponse> => {
          return await submitHomeContactApiHandler(payload);
        },
        onSuccess: (response: SubmitHomeContactResponse) => {
          toast.success(response.message)
          setFormData({
            name: "",
            mobile: { code: "+ 91", value: "" },
            email: "",
          })
          setOpenContactPopup(false)
          onClose()
        },
        onError: (error: any) => {
          if(Array.isArray(error.message)){
            error.message.map((item: string) => {
              toast.success(item)
            })
          }else{
            toast.success(error.message)
          }
        },
      });

      const { mutate: sendOtp, isPending: isOtpSending } = useMutation({
          mutationFn: (payload: ContactUsHomeOtpPayload): Promise<ContactUsHOmeOtpResponse> =>
            contactUsHomeOtpApiHandler(payload),
          onSuccess: async (res) => {
            toast.success(res.message ?? "OTP sent successfully")
          },
          onError: (err: any) => {
            console.error("OTP Verify Error:", err);
          },
        });

    const handleSubmit = () => {
      if(!validate()){
        return 
      }
      
      if(isUserLoggedIn){
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.mobile.value
        }
        submitEndUserContactDetails(payload)
      }else{
        sendOtp({phone: formData.mobile.value})
        setOpenOtpPopup(true)
        setOpenContactPopup(false)
      }
    }


    React.useEffect(() => {
      if(open){
        let userData: any = localStorage.getItem('user')
        if(userData){
          userData = JSON.parse(userData)
          setIsUserLoggedIn(true)
          setFormData((pre) => ({
            ...pre, 
            name: userData.name,
            mobile: {code: '+ 91', value: userData.phone},
            email: userData.email
          }))
        }
      }
      setOpenContactPopup(open)
    },[open])

  const dynamicClass = (flag: string) => {
    return `
                  box-border h-[40.81px] px-4 py-2 text-sm rounded-full 
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
        open={openContactPopup}
        onClose={handleClose}
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
          <div>
            <div className="flex justify-between w-full">
              <p className="font-semibold">Contact Channel Partner</p>
              <Image
                onClick={() => {
                  setFormData({
                    name: "",
                    mobile: { code: "+ 91", value: "" },
                    email: "",
                  })
                  setOpenContactPopup(false)
                  onClose();
                }}
                src="/assets/close-icon.svg"
                alt="close"
                width={24}
                height={24}
                className="cursor-pointer"
              />
            </div>

            <div className="flex flex-col items-center gap-3 w-full pt-2 md:w-[400px] p-1">
              <div className="w-full">
                <p className="required-label text-sm lg:text-base 2xl:text-lg text-text-black pb-1">
                  First Name
                </p>
                <div>
                  <InputBase
                    placeholder="Enter first name"
                    fullWidth
                    className={dynamicClass(errors.name)}
                    inputProps={{
                      className: "placeholder-gray",
                    }}
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                  {errors.name && (
                    <p className="pt-1 text-red-500 text-xs">{errors.name}</p>
                  )}
                </div>
              </div>
              <div className="w-full">
                <p className="required-label text-sm lg:text-base 2xl:text-lg text-text-black pb-1">
                  Email Address
                </p>
                <>
                  <InputBase
                    placeholder="Enter email address"
                    fullWidth
                    // className="box-border h-[47.81px] px-4 py-2 text-text-gray text-sm rounded-full border border-border focus:outline-none focus:border-blue"
                    className={dynamicClass(errors.email)}
                    inputProps={{
                      className: "placeholder-gray",
                    }}
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="pt-1 text-red-500 text-xs">{errors.email}</p>
                  )}
                </>
              </div>

              <div className="w-full">
                <p className="required-label text-sm lg:text-base 2xl:text-lg text-text-black pb-1">
                  Phone Number
                </p>
                <div className="custom-mobile-input">
                  <MobileInput
                    placeHolder="Enter mobile number"
                    required={true}
                    validationMessage={errors.mobile}
                    value={formData.mobile.value}
                    countryCode={formData.mobile.code}
                    onChange={handleMobileInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="pt-3">
              <button disabled={isOtpSending || enduserLoader} onClick={handleSubmit} className="animated-button mt-2 px-[30px] py-[12px] cursor-pointer h-full w-full">
                <span className="flex items-center justify-center gap-[6px] relative z-11">
                  <p className="text-nowrap font-medium text-sm">{'Get Contact Details'}</p>
                </span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ContactOtp open={openOptPopup} name={formData.name} email={formData.email} mobileNumber={formData.mobile.value} onClose={() => {
        setOpenOtpPopup(false)
      }}/>
    </React.Fragment>
  );
}
