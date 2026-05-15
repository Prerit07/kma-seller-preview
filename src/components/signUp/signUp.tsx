"use client";

import MobileInput from "../common/mobileInput";
import RadioSwitch from "../common/radioSwitch";

import { useEffect, useState } from "react";
import Spinner from "../common/spinner";
import { ListType, UserType } from "@/types/user";
import { LIST_TYPE, USER_TYPE } from "@/lib/enums";
import { useMutation } from "@tanstack/react-query";
import {
  OtpPayload,
  sendSignUpOtpApiHandler,
  SendOtpResponse,
} from "@/services/authService";
import { mobileNumberValidator } from "@/lib/commonValidator";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { clearAuthCookies, createURLSearchParam } from "@/lib/helper";
import { useMediaQuery, useTheme } from "@mui/material";
import { toast } from "react-toastify";
import { setFormField } from "@/store/createAccountSlice";
import { useDispatch } from "react-redux";

interface OptionType {
  value: UserType;
  label: string;
}

interface PropertyoptionType {
  value: ListType;
  label: string;
}


interface MobileInput {
  value: string,
  validationMessage: string,
  code: string,
}

const partnerType: OptionType[] = [
  {
    value: USER_TYPE.OWNER,
    label: "Owner",
  },
  {
    value: USER_TYPE.CHANNEL_PARTNER,
    label: "Channel Partner",
  },
];

const propertyType: PropertyoptionType[] = [
  {
    value: LIST_TYPE.SELL,
    label: "I want to Sell",
  },
  {
    value: LIST_TYPE.RENT,
    label: "I want to Rent",
  },
];

export default function SignUp() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const mobileNumber = searchParams.get('mobile')
  const code = searchParams.get('code')
  const intent = searchParams.get('propertyIntent')
  const owner = searchParams.get('ownerType')

  const [selectedPartnerType, setSelectedPartnerType] = useState<UserType>(
    USER_TYPE.OWNER
  );
  const [propertyIntent, setPropertyIntent] =
    useState<ListType>(LIST_TYPE.SELL);

  const [mobileInput, setMobileInput] = useState<MobileInput>({value: '', validationMessage: '', code: '+91'})

  const handlePartnerChange = (value: UserType) => {
    setSelectedPartnerType(value);
    dispatch(setFormField({ key: "userType", value }));
    setMobileInput({...mobileInput, value: ''})
    setPropertyIntent(LIST_TYPE.SELL);
  };

  const handlePropertyChange = (value: ListType) => {
    setPropertyIntent(value);
  };

  const handleMobileInputChange = (value: string, code: string) => {
    const msg = mobileInput.validationMessage ? mobileNumberValidator(value) : ''
    setMobileInput({...mobileInput, value: value, code: code, validationMessage: msg})
  }

  const {
    mutate: handleSendOtp,
    isPending,
  } = useMutation({
    mutationFn: async (payload: OtpPayload): Promise<SendOtpResponse> => {
      return await sendSignUpOtpApiHandler(payload);
    },
    onSuccess: (response: SendOtpResponse) => {
      const params = createURLSearchParam({
        mobile: mobileInput.value,
        code: mobileInput.code,
        ownerType: selectedPartnerType,
        ...(selectedPartnerType == USER_TYPE.OWNER ? {propertyIntent: propertyIntent,} : ''),
        isOtp: true,
        flow: "signup",
      })
      toast.success(response.message ?? "OTP sent successfully")
      router.push(`/user-flow${params}`)
    },
    onError: (error: any) => {
      if(Array.isArray(error.message)){
        error.message.map((item: string) => {
          toast.error(item)
        })
      }else{
        toast.error(error.message)
      }
    },
  });

  const handleContinue = () => {
    let msg = mobileNumberValidator(mobileInput.value)
    if(msg){
      setMobileInput({...mobileInput, validationMessage: msg})
      return
    }
    const paylaod = { phone: mobileInput.value, role: selectedPartnerType}
    handleSendOtp(paylaod)
  }

  const handleRedirectToLogin = () => {
    const params = createURLSearchParam({
      isLogin: true
    })
    router.push(`${pathname}${params}`);
  }

  useEffect(() => {
    if(mobileNumber){
      setMobileInput({...mobileInput, value: mobileNumber ?? '', code: ''})
    }
    if(owner){
      setSelectedPartnerType(owner as UserType)
      dispatch(setFormField({ key: "userType", value: "OWNER" }));
    }
    if(owner == USER_TYPE.OWNER){
      setPropertyIntent(intent as ListType)
    }
    // localStorage.clear()
    // clearAuthCookies()
  }, [mobileNumber, code, owner, intent]) 

  return (
    <>
      <div className="relative text-white rounded-full w-[90%] font-medium text-base -top-[40px]">
        Who are you?
      </div>
      <div
        className="bg-white relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-b-xl rounded-tr-xl"
        style={{ boxShadow: "0px 4px 20px 0px #0000000D", flexGrow: 11 }}
      >
        <div className="absolute rounded-full w-[90%] -top-[32px] rounded-[100px] bg-white h-[60px]" />
        <div>
          <div className="relative flex w-[90%] -top-[32px] text-sm gap-4 bg-white p-2 rounded-full">
            {partnerType.map((item) => (
              <RadioSwitch
                key={item.value}
                label={item.label}
                value={item.value}
                checked={selectedPartnerType === item.value}
                labelStyle="text-black text-xs 1xl:text-sm font-medium font-ibm-plex-sans"
                onChagne={() => handlePartnerChange(item.value)}
              />
            ))}
          </div>

          <div className="relative -top-[32px] px-4 pt-4 sm:px-8 flex flex-col w-full">
            {selectedPartnerType == USER_TYPE.OWNER ? (
              <>
                <p className="text-base lg:text-lg 1xl:text-xl font-semibold text-text-black mb-1">
                  Post Your Property - {" "}
                  <span className="text-accent">Zero Listing Fee!</span>
                </p>
                <p className="text-sm 1xl:text-base text-text-gray">
                  No more spam calls or fake leads. List directly and let our team handle 80% of the work, from pre-sales to field support.
                </p>

                <p className="text-sm lg:text-base 2xl:text-lg font-semibold text-text-black mt-6">
                  What do you want to do?
                </p>
                <div className="flex flex-wrap w-full text-sm gap-4 bg-white pt-2 rounded-full">
                  {propertyType.map((item) => (
                    <div className="box-border flex-1" key={item.value}>
                      <RadioSwitch
                        label={item.label}
                        value={item.value}
                        checked={propertyIntent === item.value}
                        labelStyle="text-black text-xs md:text-sm font-medium font-ibm-plex-sans"
                        onChagne={() => handlePropertyChange(item.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-base lg:text-lg 1xl:text-xl font-semibold text-text-black mb-1">
                  Grow Your Business — {" "}
                  <span className="text-accent">
                    Post Properties for Free!
                  </span>
                </p>
                <p className="text-sm 1xl:text-base text-text-gray">
                  Join 3000+ partners. Post your luxury listings and get filtered inquiries directly on your personalized CRM.
                </p>
              </>
            )}
            

            <p className="text-sm lg:text-base 2xl:text-lg font-semibold text-text-black mt-6">
              Mobile Number
            </p>
            <p className="text-sm lg:text-sm 2xl:text-lg text-text-gray mb-2">
              We'll send you a verification code to get started.
            </p>

            <MobileInput placeHolder={fullScreen ? 'Enter mobile number' : 'Enter your mobile number'} required={true} validationMessage={mobileInput.validationMessage} value={mobileInput.value} countryCode={mobileInput.code} onChange={handleMobileInputChange}/>

            <div className="flex flex-col justify-start  gap-4 items-start mt-8">
              <button
                disabled={isPending}
                onClick={handleContinue}
                className="w-full md:w-[150px] text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
              >
                <span className="gap-3 relative flex justify-center">
                  {!isPending ? (
                    <p className={`text-nowrap`}>Continue</p>
                  ) : (
                    <Spinner size={20} className="h-[24px]"/>
                  )}
                </span>
              </button>
              <p className="text-sm 1xl:text-base text-text-gray">
                Already part of the network? {" "}
                <span onClick={handleRedirectToLogin} className="text-sm lg:text-sm 2xl:text-lg font-semibold underline text-text-black cursor-pointer">
                  Login Here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
