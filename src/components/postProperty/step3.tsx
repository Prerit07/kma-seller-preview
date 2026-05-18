import ChipTag from "../common/chipTag";
import FieldLabel from "./fieldLabel";
import AmenitiesCard from "../common/amenities";
import Furnishing from "./furnishing";
import CustomCheckbox from "../common/checkbox";
const QuillEditor = dynamic(() => import("../common/editor"), { ssr: false });
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useStepProgress } from "@/api/hooks/useStepProgress";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getActiveStep, setActiveStep, setTotalProgress } from "@/store/postPropertyProgress";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAmenitiesList,
  GetAmenitiesResponse,
  getFurnishingList,
  GetFurnishingResponse,
  Step1DetailsResponse,
  step1PostPropertyDetailsApiHandler,
  Step3DetailsResponse,
  step3PostPropertyCreateApiHandler,
  step3PostPropertyDetailsApiHandler,
  Step3PostPropertyPayload,
  Step3PostPropertyResponse,
} from "@/services/postProperty";
import {
  ADDITIONAL_ROOM,
  COMMERCIAL_FURNISHING_LIST,
  CUSTOM_SECTION_NAME,
  FIELD_NAME,
  FURNISH_TYPE,
  FURNISHING_LIST,
  POWER_BACKUP,
  RECEPTION_AREA,
  TRUTY_LIST,
  WATER_SOURCE,
} from "@/lib/enums";
import { toast } from "react-toastify";
import RenderSectionName from "./renderSecitonName";
import { InputBase } from "@mui/material";
import AmenitiesList from "./amenities";
import Spinner from "../common/spinner";
import FullscreenSpinner from "../common/spinner/fullScreenSpinner";

export default function Step3({containerRef}) {
  const { calculateProgress } = useStepProgress();
  const params = useParams();

  const activeStep = useSelector(getActiveStep);
  const dispatch = useDispatch();

  const [basicStaticDetail, setBasicStaticDetail] = useState({
    propertyListFor: null,
    propertyCategory: null,
    propertyType: null,
    propertyCondition: null,
  });

  const [dynamicFieldDetails, setDynamicFieldDetails] = useState<any>({
    additionalRoom: [],
    coveredParking: 0,
    openParking: 0,
    powerBackup: null,
    waterSource: null,
    liftAvalability: null,
    propertyDescription: null,
    furnishType: null,
    furnishingsCounts: [],
    amenities: [],

    minNumberOfSeats: null,
    maxNumberOfSeats: null,
    numberOfCabins: null,
    numberOfMeetingRooms: null,
    privateWashrooms: null,
    publicWashrooms: null,
    conferenceRoom: null,
    receptionArea: null,
    privateParking: null,
    publicParking: null,
  });

  const [errors, setErrors] = useState<any>({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [openAmenitiesPopup, setOpenAmenitiesPopup] = useState(false)

  const handleUpdateFurnishedCount = (name: string, value: number) => {
    let updatedData = [...dynamicFieldDetails.furnishingsCounts];
    updatedData = updatedData.map((item) => {
      if (item.name == name) {
        return { ...item, count: value };
      }
      return item;
    });
    const isIncluded = updatedData.find((item) => item.name == name);
    if (!isIncluded) {
      updatedData = [...updatedData, { name: name, count: value }];
    }
    if (isIncluded && isIncluded.count == 0) {
      updatedData = updatedData.filter((item) => item.name != name);
    }
    setDynamicFieldDetails((pre) => ({
      ...pre,
      furnishingsCounts: updatedData,
    }));
    setErrors((pre) => ({...pre, furnishingsCounts: ''}))
  };

  const handleAddFurnished = (name: string) => {
    let updatedData = [...dynamicFieldDetails.furnishingsCounts];
    const isIncluded = updatedData.find((item) => item.name == name);
    if (!isIncluded) {
      updatedData = [...updatedData, { name: name, count: 1 }];
      setDynamicFieldDetails((pre) => ({
        ...pre,
        furnishingsCounts: updatedData,
      }));
    } else {
      updatedData = updatedData.filter((item) => item.name != name);
      setDynamicFieldDetails((pre) => ({
        ...pre,
        furnishingsCounts: updatedData,
      }));
    }
    setErrors((pre) => ({...pre, furnishingsCounts: ''}))
  };

  const handleAddRemoveAmenitise = (value: string) => {
    let updatedData = [...dynamicFieldDetails.amenities];

    let isIncluded = updatedData.find((item) => item == value);
    if (isIncluded) {
      updatedData = updatedData.filter((item) => item != value);
    } else {
      updatedData = [...updatedData, value];
    }
    setDynamicFieldDetails((pre) => ({ ...pre, amenities: updatedData }));
  };

  const renderFirstSectionLabel = () => {
      const isResidential = basicStaticDetail.propertyCategory?.code == 'residential'
      const isCommercial = basicStaticDetail.propertyCategory?.code == 'commercial'
      const isRent = basicStaticDetail.propertyListFor?.code == 'rent'
      const isSell = basicStaticDetail.propertyListFor?.code == 'sale'
      const propertyType = basicStaticDetail.propertyType?.code
      const isReadyTouse = basicStaticDetail.propertyCondition == 'ready_to_use'
      if((isRent || isSell) && isCommercial && ((['com-rent-office', 'com-sale-office'].includes(propertyType) && isReadyTouse) || ['com-rent-retail-shop', 'com-sale-retail-shop', 'com-rent-showroom', 'com-sale-showroom'].includes(propertyType))){
        return CUSTOM_SECTION_NAME.FACILITIES
      }
      
      return {name: '', subName:''}
    }

  //Show Hide the field based on condition
  const renderShowField = (fieldName: string) => {
    const isResidential = basicStaticDetail.propertyCategory?.code == 'residential'
    const isCommercial = basicStaticDetail.propertyCategory?.code == 'commercial'
    const isRent = basicStaticDetail.propertyListFor?.code == 'rent'
    const isSell = basicStaticDetail.propertyListFor?.code == 'sale'
    const isReadyTouse = basicStaticDetail.propertyCondition == 'ready_to_use'
    if(isResidential){
      if(fieldName == FIELD_NAME.ADDITIONAL_ROOM){
        if(isResidential &&  ['res-rent-flat', 'res-sale-flat', 'res-rent-villa', 'res-sale-villa', 'res-rent-house', 'res-sale-house', 'res-rent-duplex', 'res-sale-duplex', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse', 'res-rent-studio', 'res-sale-studio', 'res-rent-farmhouse', 'res-sale-farmhouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.RESERVED_PARKING){
        if(isResidential &&  ['res-rent-flat', 'res-sale-flat', 'res-rent-villa', 'res-sale-villa', 'res-rent-house', 'res-sale-house', 'res-rent-duplex', 'res-sale-duplex', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse', 'res-rent-studio', 'res-sale-studio', 'res-rent-farmhouse', 'res-sale-farmhouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.POWER_BACKUP){
        if(isResidential &&  ['res-rent-flat', 'res-sale-flat', 'res-rent-villa', 'res-sale-villa', 'res-rent-house', 'res-sale-house', 'res-rent-duplex', 'res-sale-duplex', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse', 'res-rent-studio', 'res-sale-studio', 'res-rent-farmhouse', 'res-sale-farmhouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.WATER_SOURCE){
        if(isResidential &&  ['res-rent-villa', 'res-sale-villa', 'res-rent-house', 'res-sale-house', 'res-rent-duplex', 'res-sale-duplex', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.LIFT_AVAILABILITY){
        if(isResidential &&  ['res-rent-villa', 'res-sale-villa', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.FURNISH_TYPE){
        if(isResidential &&  ['res-rent-flat', 'res-sale-flat', 'res-rent-villa', 'res-sale-villa', 'res-rent-house', 'res-sale-house', 'res-rent-duplex', 'res-sale-duplex', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse', 'res-rent-studio', 'res-sale-studio', 'res-rent-farmhouse', 'res-sale-farmhouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.AMENITIES){
        if(isResidential &&  ['res-rent-flat', 'res-sale-flat', 'res-rent-villa', 'res-sale-villa', 'res-rent-house', 'res-sale-house', 'res-rent-duplex', 'res-sale-duplex', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse', 'res-rent-studio', 'res-sale-studio', 'res-rent-farmhouse', 'res-sale-farmhouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PROPERTY_DESCRRIPTION){
        if(isResidential &&  ['res-rent-flat', 'res-sale-flat', 'res-rent-villa','res-sale-villa', 'res-rent-house', 'res-sale-house', 'res-rent-duplex', 'res-sale-duplex', 'res-rent-builder-floor', 'res-sale-builder-floor', 'res-sale-penthouse', 'res-rent-penthouse', 'res-rent-studio', 'res-sale-studio', 'res-rent-farmhouse', 'res-sale-farmhouse'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }
    }
    
    if(isCommercial){

      if(fieldName == FIELD_NAME.MIN_NUMBER_OF_SEATS){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || [].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.MAX_NUMBER_OF_SEATS){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || [].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.NUMBER_OF_CABIN){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || [].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.NUMBER_OF_MEETING_ROOM){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || [].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PRIVATE_WASHROOM){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || ['com-rent-retail-shop', 'com-sale-retail-shop', 'com-rent-showroom', 'com-sale-showroom'].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PUBLIC_WASHROOM){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || ['com-rent-retail-shop', 'com-sale-retail-shop', 'com-rent-showroom', 'com-sale-showroom'].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PRIVATE_PARKING){
        if((isRent || isSell) && (['com-rent-retail-shop', 'com-sale-retail-shop', 'com-rent-showroom', 'com-sale-showroom'].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PUBLIC_PARKING){
        if((isRent || isSell) && (['com-rent-retail-shop', 'com-sale-retail-shop', 'com-rent-showroom', 'com-sale-showroom'].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.CONFERENCE_ROOM){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || [].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.RECEPTION_AREA){
        if((isRent || isSell) && ((['com-rent-office', 'com-sale-office'].includes(basicStaticDetail.propertyType?.code ?? '') && isReadyTouse) || [].includes(basicStaticDetail.propertyType?.code ?? ''))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.FURNISH_TYPE){
        if((isRent || isSell) && ['com-rent-office', 'com-sale-office', 'com-rent-retail-shop', 'com-sale-retail-shop', 'com-rent-showroom', 'com-sale-showroom'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PROPERTY_DESCRRIPTION){
        if((isRent || isSell) && ['com-rent-office', 'com-sale-office', 'com-rent-retail-shop', 'com-sale-retail-shop', 'com-rent-showroom', 'com-sale-showroom'].includes(basicStaticDetail.propertyType?.code ?? '')){
          return true
        }
        return false
      }
    }


    return false
  }

  //Validation
  const validate = () => {
    const isResidential = basicStaticDetail.propertyCategory?.code == 'residential'
    const isCommercial = basicStaticDetail.propertyCategory?.code == 'commercial'
    let hasError = false;
    let updatedError: any = {}

    if(isResidential){
      if(renderShowField(FIELD_NAME.FURNISH_TYPE) && !dynamicFieldDetails.furnishType){
        updatedError.furnishType = 'Please select the furnish type'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.FURNISH_TYPE) && dynamicFieldDetails.furnishType == 'Furnished' && dynamicFieldDetails.furnishingsCounts.length < 3){
        updatedError.furnishingsCounts = 'Please add atleast 3 flat furnishings to continue'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.FURNISH_TYPE) && dynamicFieldDetails.furnishType == 'Semi-Furnished' && dynamicFieldDetails.furnishingsCounts.length < 1){
        updatedError.furnishingsCounts = 'Please add atleast 1 flat furnishings to continue'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.WATER_SOURCE) && !dynamicFieldDetails.waterSource){
        updatedError.waterSource = 'Please select water source'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.LIFT_AVAILABILITY) && !dynamicFieldDetails.liftAvalability){
        updatedError.liftAvalability = 'Please select lift availability'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.PROPERTY_DESCRRIPTION) && (!dynamicFieldDetails.propertyDescription || dynamicFieldDetails.propertyDescription == '<p><br></p>')){
        updatedError.propertyDescription = 'Please add property description'
        hasError = true;
      }
    }

    if(isCommercial){
      if(renderShowField(FIELD_NAME.MIN_NUMBER_OF_SEATS) && !dynamicFieldDetails.minNumberOfSeats){
        updatedError.minNumberOfSeats = 'Please enter minimun seats'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.MAX_NUMBER_OF_SEATS) && !dynamicFieldDetails.maxNumberOfSeats){
        updatedError.maxNumberOfSeats = 'Please enter maximum seats'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.NUMBER_OF_CABIN) && !dynamicFieldDetails.numberOfCabins){
        updatedError.numberOfCabins = 'cabins should be between 0 and 1000'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.NUMBER_OF_MEETING_ROOM) && !dynamicFieldDetails.numberOfMeetingRooms){
        updatedError.numberOfMeetingRooms = 'Meeting rooms should be between 0 and 100'
        hasError = true;
      }

      // if(renderShowField(FIELD_NAME.PRIVATE_WASHROOM) && !dynamicFieldDetails.privateWashrooms){
      //   updatedError.privateWashrooms = 'washrooms should be between 0 and 200'
      //   hasError = true;
      // }

      // if(renderShowField(FIELD_NAME.PUBLIC_WASHROOM) && !dynamicFieldDetails.publicWashrooms){
      //   updatedError.publicWashrooms = 'washrooms should be between 0 and 200'
      //   hasError = true;
      // }

      if(renderShowField(FIELD_NAME.FURNISH_TYPE) && !dynamicFieldDetails.furnishType){
        updatedError.furnishType = 'Please select the furnish type'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.FURNISH_TYPE) && dynamicFieldDetails.furnishType == 'Furnished' && dynamicFieldDetails.furnishingsCounts.length < 3){
        updatedError.furnishingsCounts = 'Please add atleast 3 flat furnishings to continue'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.FURNISH_TYPE) && dynamicFieldDetails.furnishType == 'Semi-Furnished' && dynamicFieldDetails.furnishingsCounts.length < 1){
        updatedError.furnishingsCounts = 'Please add atleast 1 flat furnishings to continue'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.PROPERTY_DESCRRIPTION) && (!dynamicFieldDetails.propertyDescription || dynamicFieldDetails.propertyDescription == '<p><br></p>')){
        updatedError.propertyDescription = 'Please add property description'
        hasError = true;
      }
    }
    setErrors(updatedError)
    return {hasError: hasError, errorData: updatedError};
  }

  const scrollToError = (errorsObj) => {
    const fields = Object.keys(errorsObj);
    if (!fields || fields.length === 0) return;

    const firstErrorField = fields[0];
    const el = document.getElementById(firstErrorField);
    const container = document.getElementById("formWrapper");
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();
      const offset =
        elementRect.top - containerRect.top + container.scrollTop - 80;

      container.scrollTo({
        top: offset,
        behavior: "smooth",
      });
  //     el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // const data = {
  //   message: `Scrolled to element with id 'builtUpArea'.`
  // };
    }
  };

  const { data: step1Details, isPending: step1DetailsLoader } = useQuery({
    queryKey: ["step1-in-3-details", params?.propertyId],
    queryFn: async (): Promise<Step1DetailsResponse> => {
      return step1PostPropertyDetailsApiHandler(
        String(params?.propertyId ?? "")
      );
    },
    select: (resposne: Step1DetailsResponse) => {
      return resposne;
    },
    enabled: params?.propertyId ? true : false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: step3Details, isPending:  step3DetailsLoader } = useQuery({
  queryKey: ["step3-details", params?.propertyId],
  queryFn: async (): Promise<Step3DetailsResponse> => {
    return step3PostPropertyDetailsApiHandler(String(params?.propertyId ?? ''));
  },
  select: (resposne: Step3DetailsResponse) => {
    return resposne
  },
  enabled: params?.propertyId ? true : false,
  staleTime: 0,
  refetchOnMount: true
});

const FURNISHING_LOCAL_ICONS: Record<string, string> = {
  "water purifier": "/assets/water-purifier.png",
  "fan": "/assets/fan.png",
  "fridge": "/assets/fridge.png",
  "exhaust fan": "/assets/external-fan.png",
  "dining table": "/assets/dining.png",
  "geyser": "/assets/geyser.png",
  "stove": "/assets/stove.png",
  "light": "/assets/light.png",
  "curtains": "/assets/curtains.png",
  "modular kitchen": "/assets/kitchen.png",
  "tv": "/assets/television.png",
  "chimney": "/assets/chimeny.png",
  "bed": "/assets/bed.png",
  "ac": "/assets/air-conditioner.png",
  "wardrobe": "/assets/wardrobe.png",
  "sofa": "/assets/sofa.png",
  "washing machine": "/assets/washing-machine.png",
  "microwave": "/assets/microwave.png",
};
const { data: furnishingList } = useQuery({
  queryKey: ["furnishing"],
  queryFn: async (): Promise<GetFurnishingResponse[]> => {
    return getFurnishingList();
  },
  select: (resposne: GetFurnishingResponse[]) => {
    // Backend stores placeholder icon identifiers (e.g. "water-purifier-icon")
    // that don't exist on S3. Map to the local /public/assets icons we ship.
    return resposne?.map((item) => ({
      icon: FURNISHING_LOCAL_ICONS[item.name?.toLowerCase()?.trim()] ?? "/assets/sofa.png",
      label: item.name,
    })) ?? [];
  },
  staleTime: 0,
  refetchOnMount: true
});

const { data: amenitiesList } = useQuery({
  queryKey: ["amenities"],
  queryFn: async (): Promise<GetAmenitiesResponse[]> => {
    return getAmenitiesList();
  },
  select: (resposne: GetAmenitiesResponse[]) => {
    let updatedData = resposne?.map(item => {
      return item.name
    }) ?? []
    return updatedData
  },
  staleTime: 0,
  refetchOnMount: true
});

  const generatePayload = () => {
    let furnishingsCounts = dynamicFieldDetails.furnishingsCounts.map(item => ({item: item.name, count: item.count}))
    return {
      propertyId: String(params?.propertyId),
      additionalRooms: dynamicFieldDetails?.additionalRoom,
      reservedParkingCovered: Number(dynamicFieldDetails.coveredParking),
      reservedParkingOpen: Number(dynamicFieldDetails.openParking),
      powerBackup: dynamicFieldDetails.powerBackup,
      furnishType: dynamicFieldDetails.furnishType,
      furnishingsCounts: furnishingsCounts,
      amenities: dynamicFieldDetails.amenities,
      propertyDescription: dynamicFieldDetails.propertyDescription && dynamicFieldDetails.propertyDescription != '' ? dynamicFieldDetails.propertyDescription : null,
      waterSource: dynamicFieldDetails.waterSource,
      isLiftAvailable: dynamicFieldDetails.liftAvalability == 'yes' ? true : false,
      minNumberOfSeats: dynamicFieldDetails.minNumberOfSeats,
      maxNumberOfSeats: dynamicFieldDetails.maxNumberOfSeats,
      numberOfCabins: dynamicFieldDetails.numberOfCabins,
      numberOfMeetingRooms: dynamicFieldDetails.numberOfMeetingRooms,
      privateWashrooms: dynamicFieldDetails.privateWashrooms,
      publicWashrooms: dynamicFieldDetails.publicWashrooms,
      conferenceRoom: dynamicFieldDetails.conferenceRoom,
      receptionArea: dynamicFieldDetails.receptionArea,
    }
  }

  const { mutate: handleStep3Submit, isPending: step3Loader } = useMutation({
    mutationFn: async (
      payload: Step3PostPropertyPayload
    ): Promise<Step3PostPropertyResponse> => {
      return await step3PostPropertyCreateApiHandler(payload);
    },
    onSuccess: (response: Step3PostPropertyResponse) => {
      dispatch(setActiveStep({step: activeStep + 1}))
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

  useEffect(() => {
    if(step3Details){
      let furnishing = step3Details.furnishingsCounts.map(item => ({name: item.item, count: item.count}))
      setDynamicFieldDetails((pre) => ({
        ...pre,
        additionalRoom: step3Details?.additionalRooms,
        coveredParking: Number(step3Details?.reservedParkingCovered),
        openParking: Number(step3Details?.reservedParkingOpen),
        powerBackup: step3Details?.powerBackup,
        waterSource: step3Details?.waterSource,
        liftAvalability: step3Details?.isLiftAvailable,
        propertyDescription: step3Details?.propertyDescription,
        amenities: step3Details?.amenities,
        furnishType: step3Details?.furnishType,
        furnishingsCounts: furnishing,
        minNumberOfSeats: step3Details?.minNumberOfSeats,
        maxNumberOfSeats: step3Details?.maxNumberOfSeats,
        numberOfCabins: step3Details?.numberOfCabins,
        numberOfMeetingRooms: step3Details?.numberOfMeetingRooms,
        privateWashrooms: step3Details?.privateWashrooms,
        publicWashrooms: step3Details?.publicWashrooms,
        conferenceRoom: step3Details?.conferenceRoom,
        receptionArea: step3Details?.receptionArea,
        privateParking: step3Details?.privateParking,
        publicParking: step3Details?.publicParking,
      }))
    }
  },[step3Details])

  useEffect(() => {
    if (step1Details) {
      setBasicStaticDetail((pre) => ({
        ...pre,
        propertyListFor: step1Details?.listingType,
        propertyCategory: step1Details?.category,
        propertyType: step1Details?.propertyType,
        propertyCondition: step1Details?.propertyCondition
      }));
      dispatch(setTotalProgress({progress: step1Details.progressPercentage}))
    }
  }, [step1Details]);

  // useEffect(() => {
  //   calculateProgress();
  // }, [dynamicFieldDetails, basicStaticDetail]);

  const renderFurnishing = () => {
    return furnishingList ?? []
  }

  return (
    <>
    {((step1DetailsLoader || step3DetailsLoader) && params?.propertyId) ? <FullscreenSpinner/> : <>
      <div className="flex flex-col gap-4" ref={containerRef}>
        <p className="text-text-black font-semibold text-lg 2md:text-xl pb-2">
          Amenities & Description
        </p>

        {/* Commercial flow start */}

        {renderFirstSectionLabel().name && <RenderSectionName customClass="pt-3" data={renderFirstSectionLabel()}/>}

        {(renderShowField(FIELD_NAME.MIN_NUMBER_OF_SEATS) || renderShowField(FIELD_NAME.PUBLIC_WASHROOM)) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
                  
          {renderShowField(FIELD_NAME.MIN_NUMBER_OF_SEATS) && <div id='minNumberOfSeats' data-field={FIELD_NAME.MIN_NUMBER_OF_SEATS} data-has-value={!!dynamicFieldDetails.minNumberOfSeats}>
            <FieldLabel label="Min. Number of seats" customClass="pb-2" required={true} />
            <InputBase
              placeholder="Enter number"
              fullWidth
              value={dynamicFieldDetails.minNumberOfSeats ?? ''}
              onChange={(e) => {
                const input = e.target.value;
                const isOnlyDigits = /^\d*$/.test(input);
                if (!isOnlyDigits) return;
                if(Number(input) > 999) return
                setDynamicFieldDetails((pre) => ({...pre, minNumberOfSeats: input}))
                setErrors((pre) => ({...pre, minNumberOfSeats: ''}))
              }}
              className={
                "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
              }
              inputProps={{
                className: "placeholder-gray",
              }}
            />
            {errors?.minNumberOfSeats && <p className="pt-1 text-red-500 text-xs">{errors.minNumberOfSeats}</p>}
          </div>}

          {renderShowField(FIELD_NAME.MAX_NUMBER_OF_SEATS) && <div id='maxNumberOfSeats' data-field={FIELD_NAME.MAX_NUMBER_OF_SEATS} data-has-value={!!dynamicFieldDetails.maxNumberOfSeats}>
            <FieldLabel
              label="Max. Number of seats"
              customClass="pb-2"
              required={true}
            />
            <InputBase
              placeholder="Enter number"
              fullWidth
              value={dynamicFieldDetails.maxNumberOfSeats ?? ''}
              onChange={(e) => {
                const input = e.target.value;
                const isOnlyDigits = /^\d*$/.test(input);
                if (!isOnlyDigits) return;
                if(Number(input) > 999) return
                setDynamicFieldDetails((pre) => ({...pre, maxNumberOfSeats: input}))
                setErrors((pre) => ({...pre, maxNumberOfSeats: ''}))
              }}
              className={
                "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
              }
              inputProps={{
                className: "placeholder-gray",
              }}
            />
            {errors?.maxNumberOfSeats && <p className="pt-1 text-red-500 text-xs">{errors.maxNumberOfSeats}</p>}
          </div>}
        </div>}

        {(renderShowField(FIELD_NAME.NUMBER_OF_CABIN) || renderShowField(FIELD_NAME.NUMBER_OF_MEETING_ROOM)) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
                  
          {renderShowField(FIELD_NAME.NUMBER_OF_CABIN) && <div id='numberOfCabins' data-field={FIELD_NAME.NUMBER_OF_CABIN} data-has-value={!!dynamicFieldDetails.numberOfCabins}>
            <FieldLabel label="Number of Cabins" customClass="pb-2" required={true} />
            <InputBase
              placeholder="Enter number"
              fullWidth
              value={dynamicFieldDetails.numberOfCabins ?? ''}
              onChange={(e) => {
                const input = e.target.value;
                const isOnlyDigits = /^\d*$/.test(input);
                if (!isOnlyDigits) return;
                if(Number(input) > 1000) return
                setDynamicFieldDetails((pre) => ({...pre, numberOfCabins: input}))
                setErrors((pre) => ({...pre, numberOfCabins: ''}))
              }}
              className={
                "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
              }
              inputProps={{
                className: "placeholder-gray",
              }}
            />
            {errors?.numberOfCabins && <p className="pt-1 text-red-500 text-xs">{errors.numberOfCabins}</p>}
          </div>}

          {renderShowField(FIELD_NAME.NUMBER_OF_MEETING_ROOM) && <div id='numberOfMeetingRooms' data-field={FIELD_NAME.NUMBER_OF_MEETING_ROOM} data-has-value={!!dynamicFieldDetails.numberOfMeetingRooms}>
            <FieldLabel
              label="Number of Meeting Rooms"
              customClass="pb-2"
              required={true}
            />
            <InputBase
              placeholder="Enter number"
              fullWidth
              value={dynamicFieldDetails.numberOfMeetingRooms ?? ''}
              onChange={(e) => {
                const input = e.target.value;
                const isOnlyDigits = /^\d*$/.test(input);
                if (!isOnlyDigits) return;
                if(Number(input) > 100) return
                setDynamicFieldDetails((pre) => ({...pre, numberOfMeetingRooms: input}))
                setErrors((pre) => ({...pre, numberOfMeetingRooms: ''}))
              }}
              className={
                "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
              }
              inputProps={{
                className: "placeholder-gray",
              }}
            />
            {errors?.numberOfMeetingRooms && <p className="pt-1 text-red-500 text-xs">{errors.numberOfMeetingRooms}</p>}
          </div>}
        </div>}

        {(renderShowField(FIELD_NAME.PRIVATE_WASHROOM) || renderShowField(FIELD_NAME.PUBLIC_WASHROOM)) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
                  
        {renderShowField(FIELD_NAME.PRIVATE_WASHROOM) && <div id='privateWashrooms' data-field={FIELD_NAME.PRIVATE_WASHROOM} data-has-value={!!dynamicFieldDetails.privateWashrooms}>
          <FieldLabel label="Private washrooms" customClass="pb-2"/>
          <InputBase
            placeholder="Enter number"
            fullWidth
            value={dynamicFieldDetails.privateWashrooms ?? ''}
            onChange={(e) => {
              const input = e.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if (!isOnlyDigits) return;
              if(Number(input) > 200) return
              setDynamicFieldDetails((pre) => ({...pre, privateWashrooms: input}))
              setErrors((pre) => ({...pre, privateWashrooms: ''}))
            }}
            className={
              "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
            }
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.privateWashrooms && <p className="pt-1 text-red-500 text-xs">{errors.privateWashrooms}</p>}
        </div>}

        {renderShowField(FIELD_NAME.PUBLIC_WASHROOM) && <div id='publicWashrooms' data-field={FIELD_NAME.PUBLIC_WASHROOM} data-has-value={!!dynamicFieldDetails.publicWashrooms}>
          <FieldLabel
            label="Public Washrooms"
            customClass="pb-2"
          />
          <InputBase
            placeholder="Enter number"
            fullWidth
            value={dynamicFieldDetails.publicWashrooms ?? ''}
            onChange={(e) => {
              const input = e.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if (!isOnlyDigits) return;
              if(Number(input) > 200) return
              setDynamicFieldDetails((pre) => ({...pre, publicWashrooms: input}))
              setErrors((pre) => ({...pre, publicWashrooms: ''}))
            }}
            className={
              "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
            }
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.publicWashrooms && <p className="pt-1 text-red-500 text-xs">{errors.publicWashrooms}</p>}
        </div>}
        </div>}

        {renderShowField(FIELD_NAME.PRIVATE_PARKING) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3 items-end">      
        {renderShowField(FIELD_NAME.PRIVATE_PARKING) && <div id='coveredParking' data-field={FIELD_NAME.PRIVATE_PARKING} data-has-value={!!dynamicFieldDetails.coveredParking}>
          <FieldLabel label="Parking" customClass="pb-2" />
          <InputBase
            placeholder="Enter private parking"
            fullWidth
            value={dynamicFieldDetails.coveredParking ?? ''}
            onChange={(e) => {
              const input = e.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if (!isOnlyDigits) return;
              if(Number(input) > 99) return
              setDynamicFieldDetails((pre) => ({...pre, coveredParking: input}))
              setErrors((pre) => ({...pre, coveredParking: ''}))
            }}
            className={
              "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
            }
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.coveredParking && <p className="pt-1 text-red-500 text-xs">{errors.coveredParking}</p>}
        </div>}

        {renderShowField(FIELD_NAME.PUBLIC_PARKING) && <div id='openParking' data-field={FIELD_NAME.PUBLIC_PARKING} data-has-value={!!dynamicFieldDetails.reservedParkingOpen}>
          <FieldLabel
            label=""
            customClass="pb-2"
          />
          <InputBase
            placeholder="Enter public parking"
            fullWidth
            value={dynamicFieldDetails.openParking ?? ''}
            onChange={(e) => {
              const input = e.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if (!isOnlyDigits) return;
              if(Number(input) > 99) return
              setDynamicFieldDetails((pre) => ({...pre, openParking: input}))
              setErrors((pre) => ({...pre, openParking: ''}))
            }}
            className={
              "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
            }
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.openParking && <p className="pt-1 text-red-500 text-xs">{errors.openParking}</p>}
        </div>}
      </div>}

        {(renderShowField(FIELD_NAME.CONFERENCE_ROOM) || renderShowField(FIELD_NAME.RECEPTION_AREA)) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
                  
          {renderShowField(FIELD_NAME.CONFERENCE_ROOM) && <div id='conferenceRoom' data-field={FIELD_NAME.CONFERENCE_ROOM} data-has-value={!!dynamicFieldDetails.conferenceRoom}>
            <FieldLabel label="Conference Room" customClass="pb-2" />
            <InputBase
              placeholder="Enter number"
              fullWidth
              value={dynamicFieldDetails.conferenceRoom ?? ''}
              onChange={(e) => {
                const input = e.target.value;
                const isOnlyDigits = /^\d*$/.test(input);
                if (!isOnlyDigits) return;
                if(Number(input) > 200) return
                setDynamicFieldDetails((pre) => ({...pre, conferenceRoom: input}))
                setErrors((pre) => ({...pre, conferenceRoom: ''}))
              }}
              className={
                "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
              }
              inputProps={{
                className: "placeholder-gray",
              }}
            />
            {errors?.conferenceRoom && <p className="pt-1 text-red-500 text-xs">{errors.conferenceRoom}</p>}
          </div>}

          {renderShowField(FIELD_NAME.RECEPTION_AREA) && <div id='receptionArea' data-field={FIELD_NAME.RECEPTION_AREA} data-has-value={!!dynamicFieldDetails.numberOfMeetingRooms}>
            <FieldLabel
              label="Reception Area"
              customClass="pb-2"
            />
            <div className="flex flex-wrap gap-3">
              {
              RECEPTION_AREA.map((item) => {
                return(
                  <ChipTag
                    checked={item.value == dynamicFieldDetails.receptionArea}
                    label={item.name}
                    onChagne={() => {
                      setDynamicFieldDetails((pre) => ({...pre, receptionArea: item.value}))
                      setErrors((pre) => ({...pre, receptionArea: ''}))
                    }}
                    value={dynamicFieldDetails.receptionArea}
                    isIcon={false}
                    containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                  />
                )
              })
              }
              </div>
            {errors?.receptionArea && <p className="pt-1 text-red-500 text-xs">{errors.receptionArea}</p>}
          </div>}
        </div>}


          
          {/* Commercial flow End */}
        {renderShowField(FIELD_NAME.ADDITIONAL_ROOM) && <div>
          <FieldLabel label="Additional Rooms" />
          <div className="flex flex-wrap gap-3 pt-2 flex-wrap">
            {ADDITIONAL_ROOM.map((item) => {
              let isIncluded = dynamicFieldDetails.additionalRoom.includes(item)
              return (
                <ChipTag
                  checked={isIncluded}
                  label={item}
                  onChagne={() => {
                    if(isIncluded){
                      let uddated = dynamicFieldDetails.additionalRoom.filter(additional => additional != item)
                      setDynamicFieldDetails((pre) => ({
                        ...pre,
                        additionalRoom: uddated,
                      }));
                    }else{
                      setDynamicFieldDetails((pre) => ({
                        ...pre,
                        additionalRoom: [...dynamicFieldDetails.additionalRoom, item],
                      }));
                    }
                    
                  }}
                  value={item}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[150px]"
                />
              );
            })}
          </div>
        </div>}

        {renderShowField(FIELD_NAME.RESERVED_PARKING) &&<div>
          <FieldLabel label="Reserved Parking (Optional)" />
          <div className="flex flex-col 2md:flex-row gap-6 pt-2">
            <div className="flex items-center justify-start gap-3">
              <p className="text-sm text-text-gray">Covered Parking</p>
              <div className="flex gap-2 items-center">
                <div
                  onClick={() => {
                    setDynamicFieldDetails((pre) => ({
                      ...pre,
                      coveredParking:
                        Number(dynamicFieldDetails.coveredParking) > 0
                          ? Number(dynamicFieldDetails.coveredParking) - 1
                          : 0,
                    }));
                  }}
                  className="select-none cursor-pointer font-light border border-border rounded-full w-6 h-6 text-[20px] leading-[20px] text-center"
                >
                  –
                </div>
                <p>{dynamicFieldDetails?.coveredParking}</p>
                <div
                  onClick={() => {
                    setDynamicFieldDetails((pre) => ({
                      ...pre,
                      coveredParking:
                        Number(dynamicFieldDetails.coveredParking) < 100
                          ? Number(dynamicFieldDetails.coveredParking) + 1
                          : 100,
                    }));
                  }}
                  className="select-none cursor-pointer font-light border border-border rounded-full w-6 h-6 text-[20px] leading-[20px] text-center"
                >
                  +
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start gap-3">
              <p className="text-sm text-text-gray">Open Parking</p>
              <div className="flex gap-2 items-center">
                <div
                  onClick={() => {
                    setDynamicFieldDetails((pre) => ({
                      ...pre,
                      openParking:
                        Number(dynamicFieldDetails.openParking) > 0
                          ? Number(dynamicFieldDetails.openParking) - 1
                          : 0,
                    }));
                  }}
                  className="select-none cursor-pointer font-light border border-border rounded-full w-6 h-6 text-[20px] leading-[20px] text-center"
                >
                  –
                </div>
                <p>{dynamicFieldDetails?.openParking}</p>
                <div
                  onClick={() => {
                    setDynamicFieldDetails((pre) => ({
                      ...pre,
                      openParking:
                        Number(dynamicFieldDetails.openParking) < 100
                          ? Number(dynamicFieldDetails.openParking) + 1
                          : 100,
                    }));
                  }}
                  className="select-none cursor-pointer font-light border border-border rounded-full w-6 h-6 text-[20px] leading-[20px] text-center"
                >
                  +
                </div>
              </div>
            </div>
          </div>
        </div>}

        {renderShowField(FIELD_NAME.POWER_BACKUP) &&<div>
          <FieldLabel label="Power Back-up" />
          <div className="flex flex-wrap gap-3 pt-2">
            {POWER_BACKUP.map((item) => {
              return (
                <ChipTag
                  checked={item == dynamicFieldDetails.powerBackup}
                  label={item}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({
                      ...pre,
                      powerBackup: item,
                    }));
                  }}
                  value={item}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[150px]"
                />
              );
            })}
          </div>
        </div>}

        {renderShowField(FIELD_NAME.WATER_SOURCE) && <div id='waterSource' data-field={FIELD_NAME.WATER_SOURCE} data-has-value={!!dynamicFieldDetails.waterSource}>
          <FieldLabel label="Water Source" required={true}/>
          <div className="flex flex-wrap gap-3 pt-2">
            {
              WATER_SOURCE.map(item => {
                return(
                  <ChipTag
                    checked={item.value == dynamicFieldDetails.waterSource}
                    label={item.name}
                    onChagne={() => {
                      setDynamicFieldDetails((pre) => ({...pre, waterSource: item.value}))
                    }}
                    value={dynamicFieldDetails.waterSource}
                    isIcon={false}
                    containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                  />
                )
              })
            }
          </div>
            {errors?.waterSource && <p className="pt-1 text-red-500 text-xs">{errors.waterSource}</p>}
        </div>}

        {renderShowField(FIELD_NAME.LIFT_AVAILABILITY) && <div id='liftAvalability' data-field={FIELD_NAME.LIFT_AVAILABILITY} data-has-value={!!dynamicFieldDetails.liftAvalability}>
          <FieldLabel label="Lift Availability" required={true}/>
          <div className="flex flex-wrap gap-3 pt-2">
            {
              TRUTY_LIST.map(item => {
                return(
                  <ChipTag
                    checked={item.value == dynamicFieldDetails.liftAvalability}
                    label={item.name}
                    onChagne={() => {
                      setDynamicFieldDetails((pre) => ({...pre, liftAvalability: item.value}))
                    }}
                    value={dynamicFieldDetails.liftAvalability}
                    isIcon={false}
                    containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                  />
                )
              })
            }
          </div>
            {errors?.liftAvalability && <p className="pt-1 text-red-500 text-xs">{errors.liftAvalability}</p>}
        </div>}

        {renderShowField(FIELD_NAME.FURNISH_TYPE) &&<div id='furnishType' className="rounded-[10px] p-3">
          <FieldLabel label="Furnish Type" customClass="text-base!" required={true}/>
          <div className="flex flex-wrap gap-3 pt-2">
            {FURNISH_TYPE.map((item) => {
              return (
                <ChipTag
                  checked={item.value == dynamicFieldDetails.furnishType}
                  label={item.name}
                  onChagne={() => {
                    if(dynamicFieldDetails.furnishType == item.value){
                      setDynamicFieldDetails((pre) => ({
                      ...pre,
                      furnishType: item.value,
                    }));
                    }else{
                      setDynamicFieldDetails((pre) => ({
                      ...pre,
                      furnishType: item.value,
                      furnishingsCounts: [],
                    }));
                    }
                    
                    if(item.value != 'Unfurnished'){
                      setPopupOpen(!popupOpen)
                    }
                    setErrors((pre) => ({...pre, furnishType: ''}))
                  }}
                  
                  value={item.value}
                  isIcon={false}
                  containerStyle="flex flex-1 justify-center gap-2 min-w-[150px]"
                />
              );
            })}
          </div>
          {errors?.furnishType && (
            <p className="pt-1 text-red-500 text-xs">{errors.furnishType}</p>
          )}

          {errors?.furnishingsCounts && (
            <p className="pt-1 text-red-500 text-xs">{errors.furnishingsCounts}</p>
          )}

          <div className="flex gap-3 flex-wrap pt-2">
            {dynamicFieldDetails.furnishingsCounts.map((item, index) => {
              let findIcon = renderFurnishing().find(
                (furnish) => furnish.label == item.name
              );
              return (
                <AmenitiesCard
                  checked={Number(item.count) > 0}
                  icon={findIcon?.icon ?? ''}
                  label={item.name}
                  count={Number(item.count)}
                  handleAddFurnished={handleAddFurnished}
                  handleUpdateFurnishedCount={handleUpdateFurnishedCount}
                />
              );
            })}
          </div>
        </div>}

        {renderShowField(FIELD_NAME.AMENITIES) &&<div className="rounded-[10px] p-3">
          <FieldLabel label="Amenities" customClass="text-base!" />

          <div
            className={`w-fit my-3 px-10 h-[40px]  flex items-center justify-center cursor-pointer border border-border rounded-full
                    `}
            onClick={() => setOpenAmenitiesPopup(!openAmenitiesPopup)}
          >
            <span className={`text-sm leading-[24px] text-center`}>
              {"+ Add Amenities"}
            </span>
          </div>

          {dynamicFieldDetails.amenities.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-2">
            {dynamicFieldDetails.amenities.map((item) => {
              return (
                <div key={item}>
                  <CustomCheckbox
                    label={item}
                    value={item}
                    checked={true}
                    onClick={handleAddRemoveAmenitise}
                  />
                </div>
              );
            })}
          </div>}
        </div>}

        {renderShowField(FIELD_NAME.PROPERTY_DESCRRIPTION) &&<div id='propertyDescription'>
          <FieldLabel label="Property Description" required={true}/>
          <FieldLabel
            label="Please write a detailed description about property so clients can understand property better or generate using our AI tool."
            customClass="text-text-gray font-normal! text-xs!"
          />

          <div className="pt-2">
            <QuillEditor 
              value={dynamicFieldDetails.propertyDescription} 
              onChange={(value) => {
                
                setDynamicFieldDetails((pre) => ({...pre, propertyDescription: value}))
                setErrors((pre) => ({...pre, propertyDescription: ''}))
              }}
            />
            {errors?.propertyDescription && (
            <p className="pt-1 text-red-500 text-xs">{errors.propertyDescription}</p>
          )}
          </div>
        </div>}
      </div>
      <div className="flex justify-center lg:justify-end w-full">
        <div className="flex flex-wrap justify-start flex-row gap-2 items-center mt-8">
          <button onClick={() => {
            if(activeStep != 1){
                dispatch(setActiveStep({step: activeStep - 1}))
            }
          }} className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap font-medium`}>Back</p>
            </span>
          </button>
          <button disabled={step3Loader} onClick={() => {
            if(activeStep != 4){
              let state = validate()
                if(state.hasError){
                  scrollToError(state.errorData);
                  return
                }
              let payload = generatePayload()
              handleStep3Submit(payload)
            }
          }} className="w-full md:w-[130px] text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer">
            <span className="gap-3 relative flex justify-center">
              {!step3Loader ? (
                <p className={`text-nowrap`}>{activeStep == 4 ? 'Submit' : 'Next'}</p>
              ) : (
                <Spinner size={20} className="h-[24px]"/>
              )}
            </span>
          </button>
        </div>
    </div>

      <Furnishing
        open={popupOpen}
        onHide={() => setPopupOpen(!popupOpen)}
        furnishingList={renderFurnishing()}
        setDynamicFieldDetails={setDynamicFieldDetails}
        dynamicFieldDetails={dynamicFieldDetails}
        handleAddFurnished={handleAddFurnished}
        handleUpdateFurnishedCount={handleUpdateFurnishedCount}
        handleAddRemoveAmenitise={handleAddRemoveAmenitise}
      />

      <AmenitiesList
        amenitiesList={amenitiesList ?? []}
        open={openAmenitiesPopup}
        onHide={() => setOpenAmenitiesPopup(!openAmenitiesPopup)}
        setDynamicFieldDetails={setDynamicFieldDetails}
        dynamicFieldDetails={dynamicFieldDetails}
        handleAddFurnished={handleAddFurnished}
        handleUpdateFurnishedCount={handleUpdateFurnishedCount}
        handleAddRemoveAmenitise={handleAddRemoveAmenitise}
      />
    </>}
    </>
  );
}
