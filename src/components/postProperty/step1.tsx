"use client";
import Image from "next/image";
import { OptionType } from "../common/asyncSelect";
import ChipTag from "../common/chipTag";
import FieldLabel from "./fieldLabel";
import ApartmentIcon from "@/assets/apartment-transparent.svg";
import IndependentHouse from "@/assets/independent-house-transparent.svg";
import Duplex from "@/assets/duplex-transparent.svg";
import IndependentFloor from "@/assets/independent-floor-transparent.svg";
import Villa from "@/assets/villa-transparent.svg";
import Penthouse from "@/assets/penthouse-transparent.svg";
import Studio from "@/assets/studio-transparent.svg";
import FarmHouse from "@/assets/farm-house-transparent.svg";
import Plot from "@/assets/plot-transparent.svg";
import Agriculture from "@/assets/agriculture-transparent.svg";
import PlotCommercial from "@/assets/plot-commercial-transparent.svg";
import DynamicInput from "../common/dynamicInput";
import { useCitySearch } from "@/api/hooks/useCitySearch";
import { useEffect, useRef, useState } from "react";
import { useBuildingSearch } from "@/api/hooks/useBuildingSearch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BhkResponse, getBhkApiHandler, getPropertyCategoryApiHandler, getPropertyListApiHandler, getPropertyTypeApiHandler, PropertyCategoryResponse, PropertyListResponse, PropertyTypePayload, PropertyTypeResponse } from "@/services/masterService";
import { PropertyCategory, PropertyList, PropertyType } from "@/types/postProperty";
import CustomOptionField from "../common/addCustomOption";
import { generateBHKAmeneties, generateBHKList } from "@/lib/helper";
import DynamicSelect from "../common/select";
import { AREA_UNIT_LIST, CONSTRUCTION_STATUS, CONSTRUCTION_TYPE, CUSTOM_SECTION_NAME, FACING_LIST, FIELD_NAME, LOCATED_NEAR, LOCATION_HUB, OWNERSHIP_LIST, PLOT_LAND_TYPE, PLOT_UNIT_LIST, PROPERTY_CONDITION, PROPERTY_CONSTRUCTION_STATUS, PROPERTY_POSSESSION_STATUS, SUITABLE_FOR, TRANSACTION_TYPE_LIST, TRUTY_LIST, ZONE_TYPE } from "@/lib/enums";
import { useDispatch, useSelector } from "react-redux";
import { getActiveStep, setActiveStep, setTotalProgress } from "@/store/postPropertyProgress";
import { gerUserCurrentCityApiHandler, GetUserCurrentCityPayload, GetUserCurrentCityResponse, resetAPIPayload, resetAPIResponse, resetPostPropertyApiHandler, Step1DetailsResponse, step1PostPropertyCreateApiHandler, step1PostPropertyDetailsApiHandler, Step1PostPropertyPayload, Step1PostPropertyResponse } from "@/services/postProperty";
import { toast } from "react-toastify";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { useStepProgress } from "@/api/hooks/useStepProgress";
import DynamicAsyncAutocomplete from "../common/dynamicAsyncSelectMui";
import { InputBase } from "@mui/material";
import RenderSectionName from "./renderSecitonName";
import { useLocalitySearch } from "@/api/hooks/useLocalitySearch";
import ConfirmationDailog from "../common/confirmationDailog";
import { setStep1Data } from "@/store/postPropertySlice";
import { getUserCoordinates } from "@/api/hooks/useGeoloaction";
import FullscreenSpinner from "../common/spinner/fullScreenSpinner";
import Spinner from "../common/spinner";

const initialState = {
    bhk: null,
    otherBhk: null,
    isStaticBhkDetails: false,
    staticBhKDetails: null,
    builtUpArea: null,
    builtUpAreaUnit: AREA_UNIT_LIST[0].value,
    carpetArea: null,
    carpetAreaUnit: AREA_UNIT_LIST[0].value,
    transactionType: null,
    propertyConstructionStatus: null,
    propertyAge: null,
    possesionDate: null,
    bathRooms: null,
    bedRooms: null,
    balconies: null,
    facing: null,
    plotArea: null,
    selectAreaUnit: AREA_UNIT_LIST[0].value,
    plotLength: null,
    plotLenghtUnit: PLOT_UNIT_LIST[0].value,
    plotWidth: null,
    plotWidthUnit: PLOT_UNIT_LIST[0].value,
    widthOfFacingRoad: null,

    //Commercial Flow extra field
    loactionHub: null,
    otherLocationHub: null,
    zoneType: null,
    propertyCondition : null,
    constructionStatus: null,
    ownership: null,
    suitableFor: [],
    entranceWidth: null,
    entranceWidthUnit: PLOT_UNIT_LIST[0].value,
    cellingHeight: null,
    ceilingHeightUnit: PLOT_UNIT_LIST[0].value,
    locatedNear: [],
    plotType: null,
    plotBreadth: null,
    openSide: null,
    constructinoDone: null,
    typeOfConstructionDone: [],
  }

function CityPlaceholder() {
  return (
    <div className="flex gap-2">
      <Image alt="search" src={"/assets/search.svg"} width={14} height={14} />
      <p className="text-text-gray text-[16px]">Search City</p>
    </div>
  );
}

export default function Step1({containerRef}) {
  const { loadCities  } = useCitySearch();
  const { loadBuildings } = useBuildingSearch();
  const { loadLocalities } = useLocalitySearch();

  const { calculateProgress, totalProgress } = useStepProgress()
  const possessionDateRef = useRef<HTMLInputElement | null>(null);
  const availabelDateRef = useRef<HTMLInputElement | null>(null);
  const hasRestoredStepRef = useRef(false);

  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams();

  const activeStep = useSelector(getActiveStep);
  const dispatch = useDispatch()

  const [openCustomFieldPopup, setOpenCustomFieldPopup] = useState<boolean>(false)
  const [openConfirmationPopup, setConfirmationPopup] = useState<boolean>(false)
  const [storeUserAction, setStoreUserAction] = useState(null)

  const [customFieldLabel, setCustomFieldLabel] = useState<string>('')

  const [basicStaticDetails, setBasicStaticDetails] = useState({
    propertyListFor: null,
    propertyCategory: null,
    propertyType: null,
    city: null,
    society: null,
    locality: null,
  })

  const [dynamicFieldDetails, setDynamicFieldDetails] = useState<any>(initialState)

  const [errors, setErrors] = useState<any>({})

  //Other list
  const [bhkList, setBhkList] = useState(generateBHKList(false))


  //Master APIS
  const { data: propertyTypeList } = useQuery({
    queryKey: ["propertyList"],
    queryFn: getPropertyListApiHandler,
    select: (data: PropertyListResponse[]): PropertyType[] => {
      const iconList = {
        'Rent': '/assets/rent-blue.svg',
        'Sale': '/assets/sell-blue.svg'
      }
      return data.map((item) => ({
        icon: iconList[item.name] ?? '',
        ...item,
      }));
    },
    staleTime: 1000 * 60 * 20,
  });

  const { data: propertyCategoryList } = useQuery({
    queryKey: ["propertyCategory"],
    queryFn: getPropertyCategoryApiHandler,
    select: (data: PropertyListResponse[]): PropertyCategory[] => {
      const iconList = {
        'Commercial': '/assets/commercial-blue.svg',
        'Residential': '/assets/residential-blue.svg'
      }
      return data.map((item) => ({
        icon: iconList[item.name] ?? '',
        ...item,
      }));
    },
    staleTime: 1000 * 60 * 20,
  });

  const { data: propertyList } = useQuery({
    queryKey: ["propertyList", basicStaticDetails.propertyCategory?.code, basicStaticDetails.propertyListFor?.code],
    queryFn: () : Promise<PropertyTypeResponse> => getPropertyTypeApiHandler({propertyListType: basicStaticDetails.propertyListFor?.code, propertyCategory: basicStaticDetails.propertyCategory?.code}),
    select: (data: PropertyTypeResponse): PropertyList[] => {
      const iconList = {
        'res-sale-flat': ApartmentIcon,
        'res-rent-flat': ApartmentIcon,
        'res-sale-house': IndependentHouse,
        'res-rent-house': IndependentHouse,
        'res-sale-duplex': Duplex,
        'res-rent-duplex': Duplex,
        'res-sale-builder-floor': IndependentFloor,
        'res-rent-builder-floor': IndependentFloor,
        'res-sale-villa': Villa,
        'res-rent-villa': Villa,
        'res-sale-penthouse': Penthouse,
        'res-rent-penthouse': Penthouse,
        'res-sale-studio': Studio,
        'res-rent-studio': Studio,
        'res-sale-farmhouse': FarmHouse,
        'res-rent-farmhouse': FarmHouse,
        'res-sale-plot': Plot,
        'res-sale-agri-land': Agriculture,

        'com-rent-office': ApartmentIcon,
        'com-sale-office': ApartmentIcon,
        'com-rent-plot': PlotCommercial,
        'com-sale-plot': PlotCommercial,
        'com-rent-retail-shop': IndependentHouse,
        'com-sale-retail-shop': IndependentHouse,
        'com-rent-showroom': Duplex,
        'com-sale-showroom': Duplex,
        'com-rent-warehouse': IndependentFloor,
        'com-sale-warehouse': IndependentFloor,
      }
      return data.propertyTypes.map((item) => ({
        icon: iconList[item.code] ?  iconList[item.code] : Studio,
        ...item,
      }));
    },
    enabled: basicStaticDetails.propertyCategory?.code && basicStaticDetails.propertyListFor?.code ? true : false,
    staleTime: 1000 * 60 * 20,
  });
  
  const { data: dynamicBhkList } = useQuery({
    queryKey: ["propertyList", basicStaticDetails.society?.id, basicStaticDetails.propertyType?.id ],
    queryFn: () : Promise<BhkResponse[]> => getBhkApiHandler({societyId: basicStaticDetails.society?.id, propertyTypeId: basicStaticDetails.propertyType?.id}),
    select: (data: BhkResponse[]): BhkResponse[] => {
      if(Array.isArray(data) && data.length > 0){
        const otherBhk = {
          id: 'other',
          name: 'Other',
          code: 'other',
          sortOrder: data.length,
          builtUpAreas: [],
          bhk: '0',
        }
        data = data.map(item => {
          let num = item.name.match(/[\d.]+/)?.[0] || "2"
          return {...item, bhk: Math.ceil(Number(num))}
        })
         return [...data,otherBhk]
      }
      return []
    },
    enabled: basicStaticDetails.society?.name && basicStaticDetails.society?.source == 'database' ? true : false,
  });

  const returnBhkList = () => {
    if(basicStaticDetails?.society?.source == 'database' && Array.isArray(dynamicBhkList) && dynamicBhkList.length > 0){
      return dynamicBhkList
    }
    return bhkList
  }

  const renderOtherBhk = () => {
    let bhkList = generateBHKList(true)
    bhkList = bhkList.map((item) => {
      return {value: item.name, label: item.name, ...item}
    })
    return bhkList as unknown as OptionType[]
  }
  const renderBHKAmeneties = () => {
    if(dynamicFieldDetails.bhk?.id == 'other' && dynamicFieldDetails.otherBhk?.value){
      return generateBHKAmeneties(dynamicFieldDetails.otherBhk?.bhk)
    }else{
      return generateBHKAmeneties(dynamicFieldDetails.bhk?.bhk)
    }
  }

  //Show Hide the field based on condition
  const renderShowField = (fieldName: string) => {

    if(fieldName == FIELD_NAME.PROPERTY_TYPE){
      if(basicStaticDetails.propertyListFor && basicStaticDetails.propertyCategory){
        return true
      }
      return false
    }

    if(basicStaticDetails.propertyCategory?.code == 'residential'){

      if(fieldName == FIELD_NAME.BHK){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.OTHERBHK){
        if(dynamicFieldDetails.bhk?.id == 'other' && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land')){
          return true
        }
        return false
      }

      // if(fieldName == FIELD_NAME.BUILT_UP_AREA){
      //   if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk?.isCustom || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
      //     return true
      //   }
      //   return false
      // }

      if(fieldName == FIELD_NAME.BUILT_UP_AREA){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && ((dynamicFieldDetails.bhk && dynamicFieldDetails.bhk?.code != 'other') || dynamicFieldDetails.otherBhk)){
          return true
        }
        return false
      }

      // if(fieldName == FIELD_NAME.CARPET_AREA){
      //   if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk?.isCustom || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
      //     return true
      //   }
      //   return false
      // }

      if(fieldName == FIELD_NAME.CARPET_AREA){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && ((dynamicFieldDetails.bhk && dynamicFieldDetails.bhk?.code != 'other') || dynamicFieldDetails.otherBhk)){
          return true
        }
        return false
      }
      if(fieldName == FIELD_NAME.TRANSACTION_TYPE){
        if(basicStaticDetails.propertyListFor?.name == 'Sale' && basicStaticDetails.propertyType && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PROPERTY_CONSTRUCTION_STATUS){
        if(basicStaticDetails.propertyListFor?.name == 'Sale' && basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.AGE_OF_PROPERTY){
      if(((basicStaticDetails.propertyListFor?.name == 'Sale' && dynamicFieldDetails.propertyConstructionStatus == 'ready_to_move') || basicStaticDetails.propertyListFor?.name == 'Rent') && basicStaticDetails.propertyType && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.POSSESION_DATE){
        if(basicStaticDetails.propertyListFor?.name == 'Sale' && dynamicFieldDetails.propertyConstructionStatus == 'under_construction' && basicStaticDetails.propertyType && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
          return true
        }
        return false
      }

      // if(fieldName == FIELD_NAME.BATHTROOMS){
      //   if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk?.isCustom || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
      //     return true
      //   }
      //   return false
      // }

      // if(fieldName == FIELD_NAME.BALCONIES){
      //   if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk?.isCustom || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
      //     return true
      //   }
      //   return false
      // }

      // if(fieldName == FIELD_NAME.BEDROOMS){
      //   if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && (dynamicFieldDetails.bhk?.isCustom || dynamicFieldDetails.otherBhk || (dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails))){
      //     return true
      //   }
      //   return false
      // }

      if(fieldName == FIELD_NAME.BATHTROOMS){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && ((dynamicFieldDetails.bhk && dynamicFieldDetails.bhk?.code != 'other') || dynamicFieldDetails.otherBhk)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.BALCONIES){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && ((dynamicFieldDetails.bhk && dynamicFieldDetails.bhk?.code != 'other') || dynamicFieldDetails.otherBhk)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.BEDROOMS){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land') && (!renderOptionalField(FIELD_NAME.SOCIETY) || basicStaticDetails.society) && ((dynamicFieldDetails.bhk && dynamicFieldDetails.bhk?.code != 'other') || dynamicFieldDetails.otherBhk)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.FACING){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code != 'res-sale-plot' && basicStaticDetails.propertyType?.code != 'res-sale-agri-land')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PLOT_AREA){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code == 'res-sale-plot' || basicStaticDetails.propertyType?.code == 'res-sale-agri-land')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.LENGTH_WIDTH){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code == 'res-sale-plot' || basicStaticDetails.propertyType?.code == 'res-sale-agri-land')){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.WIDTH_FACING_ROAD){
        if(basicStaticDetails.propertyType && (basicStaticDetails.propertyType?.code == 'res-sale-plot' || basicStaticDetails.propertyType?.code == 'res-sale-agri-land')){
          return true
        }
        return false
      }
    }

    if(basicStaticDetails.propertyCategory?.code == 'commercial'){

      if(fieldName == 'possession_date_section'){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-office', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.COMMERCIAL_PROPERTY_POSSESSTION_STATUS){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-office', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.AVAILABEL_DATE){
        if(basicStaticDetails.propertyType?.code && (['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-retail-shop', 'com-sale-showroom'].includes(basicStaticDetails.propertyType?.code) || (['com-sale-office', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code) && dynamicFieldDetails.propertyConstructionStatus == 'under_construction'))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.COMMERCIAL_AGE_OF_PROPERTY){
        if(basicStaticDetails.propertyType?.code && ((['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-office', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code) && dynamicFieldDetails.propertyConstructionStatus == 'ready_to_move'))){
          return true
        } //|| (['com-sale-office', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code) && dynamicFieldDetails.propertyConstructionStatus == 'ready_to_move'))
        return false
      }

      if(fieldName == 'about_property_section'){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-rent-plot', 'com-sale-office', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-warehouse', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

       if(fieldName == FIELD_NAME.SUITABLE_FOR){
        if(basicStaticDetails.propertyType?.code && ['com-rent-retail-shop', 'com-rent-showroom', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.LOCATION_HUB){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-office', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.OTHER_LOCATION_HUB){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-office', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-warehouse'].includes(basicStaticDetails.propertyType?.code) && dynamicFieldDetails.loactionHub == 'others'){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.ZONE_TYPE){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-sale-office'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PROPERTY_CONDITION){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-sale-office'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.COMMERCIAL_BUILT_UP_AREA){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-office', 'com-sale-retail-shop', 'com-sale-showroom'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.COMMERCIAL_CARPET_AREA){
        if(basicStaticDetails.propertyType?.code && (['com-rent-retail-shop', 'com-rent-showroom', 'com-sale-office', 'com-rent-warehouse', 'com-sale-office', 'com-sale-retail-shop', 'com-sale-showroom'].includes(basicStaticDetails.propertyType?.code) || (['com-rent-office'].includes(basicStaticDetails.propertyType?.code) && dynamicFieldDetails?.propertyCondition == 'ready_to_use'))){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.ENTRANCE_WIDTH){
        if(basicStaticDetails.propertyType?.code && ['com-rent-retail-shop', 'com-rent-showroom', 'com-sale-retail-shop', 'com-sale-showroom'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.CELLING_HEIGHT){
        if(basicStaticDetails.propertyType?.code && ['com-rent-retail-shop', 'com-rent-showroom', 'com-sale-retail-shop', 'com-sale-showroom'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.CONSTRUCTION_STATUS){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-sale-office'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

       if(fieldName == FIELD_NAME.OWNERSHIP){
        if(basicStaticDetails.propertyType?.code && ['com-rent-office', 'com-rent-retail-shop', 'com-rent-showroom', 'com-rent-warehouse', 'com-sale-retail-shop', 'com-sale-office', 'com-sale-showroom', 'com-sale-warehouse', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.LOCATED_NEAR){
        if(basicStaticDetails.propertyType?.code && ['com-rent-retail-shop', 'com-rent-showroom', 'com-sale-retail-shop', 'com-sale-showroom'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PLOT_TYPE){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.COMMERCIAL_PLOT_ARE){
        if(basicStaticDetails.propertyType?.code && ['com-rent-warehouse', 'com-sale-warehouse', 'com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }
      
      if(fieldName == FIELD_NAME.PLOT_LENGTH){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.PLOT_BREADTH){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.WIDTH_OF_FACING_IN_FEET){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.OPEN_SIDE){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot','com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.CONSTRUCTION_DONE){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.TYPE_OF_CONSTRUCTION){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code) && dynamicFieldDetails.constructinoDone == 'yes'){
          return true
        }
        return false
      }

      if(fieldName == FIELD_NAME.COMMERCIAL_FACING){
        if(basicStaticDetails.propertyType?.code && ['com-rent-plot', 'com-sale-plot'].includes(basicStaticDetails.propertyType?.code)){
          return true
        }
        return false
      }
    }
  }

  const renderOptionalField = (fieldName: string) => {
    if(fieldName == FIELD_NAME.SOCIETY){
      const optionalArray = [
        "res-rent-villa",
        "res-sale-villa",
        "res-sale-house",
        "res-rent-house",
        "res-sale-duplex",
        "res-rent-duplex",
        "res-rent-penthouse",
        "res-sale-penthouse",
        "res-sale-studio",
        "res-rent-studio",
        "res-rent-farmhouse",
        "res-sale-farmhouse",
        "res-sale-plot",
        "res-rent-builder-floor",
        "res-sale-builder-floor",
        "res-sale-agri-land",
        'com-rent-office',
        'com-rent-retail-shop',
        'com-rent-warehouse',
        'com-rent-plot',
        'com-rent-showroom',
        'com-sale-office',
        'com-sale-retail-shop',
        'com-sale-showroom',
        'com-sale-warehouse',
        'com-sale-plot'
      ];
      if(optionalArray.includes(basicStaticDetails.propertyType?.code)){
        return false
      }
      return true
    }

    if(fieldName == FIELD_NAME.COMMERCIAL_CARPET_AREA){
      if(['com-rent-office', 'com-rent-warehouse', 'com-sale-office'].includes(basicStaticDetails.propertyType?.code)){
        return false
      }
      return true
    }

    if(fieldName == FIELD_NAME.COMMERCIAL_BUILT_UP_AREA){
      if(['com-rent-warehouse'].includes(basicStaticDetails.propertyType?.code)){
        return false
      }
      return true
    }

    if(fieldName == FIELD_NAME.COMMERCIAL_PLOT_ARE){
      if(['com-rent-warehouse'].includes(basicStaticDetails.propertyType?.code)){
        return false
      }
      return true
    }
  }

  //Validation
  const validate = () => {
    let hasError = false;
    let updatedError: any = {}

    //Common Validation
    if(!basicStaticDetails.propertyListFor){
      updatedError.propertyListFor = 'Please select the property listing for'
      hasError = true;
    }

    if(!basicStaticDetails.propertyCategory){
      updatedError.propertyCategory = 'Please select the property category'
      hasError = true;
    }

    if(!basicStaticDetails.propertyType){
      updatedError.propertyType = 'Please select the property type'
      hasError = true;
    }

    if(!basicStaticDetails.city){
      updatedError.city = 'Please provide the city name'
      hasError = true;
    }

    if(renderOptionalField(FIELD_NAME.SOCIETY) && !basicStaticDetails.society){
      updatedError.society = 'Please provide the details'
      hasError = true;
    }

    if(!basicStaticDetails.locality){
      updatedError.locality = 'Please provide the locality details'
      hasError = true;
    }
    
    if(basicStaticDetails.propertyCategory?.code == 'residential'){

      //Dynamic Validation
      if(renderShowField(FIELD_NAME.BHK) && !dynamicFieldDetails.bhk){
        updatedError.bhk = 'Please select the BHK'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.OTHERBHK) && !dynamicFieldDetails.otherBhk){
        updatedError.otherBhk = 'Please select other BHK'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.BUILT_UP_AREA) && !dynamicFieldDetails.builtUpArea){
        updatedError.builtUpArea = 'Please enter a built up area'
        hasError = true
      }

      let currentBhk = Number(dynamicFieldDetails.bhk?.bhk ?? 0)
      let otherBhk = Number(dynamicFieldDetails.otherBhk?.bhk ?? 0)
      if(renderShowField(FIELD_NAME.BUILT_UP_AREA) && dynamicFieldDetails.builtUpArea && (dynamicFieldDetails.builtUpArea > ((currentBhk || otherBhk || 1) * 1500) || dynamicFieldDetails.builtUpArea < (currentBhk || otherBhk || 1) * 150)){
        updatedError.builtUpArea = `Builup area should be between ${(currentBhk || otherBhk || 1) * 150} and ${(currentBhk || otherBhk || 1) * 1500}`
        hasError = true
      }

      // if(renderShowField(FIELD_NAME.CARPET_AREA) && !dynamicFieldDetails.carpetArea){
      //   updatedError.carpetArea = 'Please enter a carpet area'
      //   hasError = true
      // }

      if(renderShowField(FIELD_NAME.CARPET_AREA) && dynamicFieldDetails.carpetArea && (Number(dynamicFieldDetails.carpetArea) > Number(dynamicFieldDetails.builtUpArea))){
        updatedError.carpetArea = 'Carpet area should be less than built up area'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.AGE_OF_PROPERTY) && !dynamicFieldDetails.propertyAge){
        updatedError.propertyAge = 'Please add Age of property details'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.TRANSACTION_TYPE) && !dynamicFieldDetails.transactionType){
        updatedError.transactionType = 'Please select transaction type'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.PROPERTY_CONSTRUCTION_STATUS) && !dynamicFieldDetails.propertyConstructionStatus){
        updatedError.propertyConstructionStatus = 'Please select construction status'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.AGE_OF_PROPERTY) && dynamicFieldDetails.propertyAge && (Number(dynamicFieldDetails.propertyAge) < 0 || Number(dynamicFieldDetails.propertyAge) > 99)){
        updatedError.propertyAge = 'Age of property should be between 0 and 99'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.POSSESION_DATE) && !dynamicFieldDetails.possesionDate){
        updatedError.possesionDate = 'Please select possession date'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.BATHTROOMS) && !dynamicFieldDetails.bathRooms){
        updatedError.bathRooms = 'Please select the bathroom count'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.BEDROOMS) && !dynamicFieldDetails.bedRooms){
        updatedError.bedRooms = 'Please select the bedroom count'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.BALCONIES) && (!dynamicFieldDetails.balconies && dynamicFieldDetails.balconies != 0)){
        updatedError.balconies = 'Please select the balconies count'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.PLOT_AREA) && (!dynamicFieldDetails.plotArea || Number(dynamicFieldDetails.plotArea ?? 0) < 10 || Number(dynamicFieldDetails.plotArea) > 100000)){
        updatedError.plotArea = 'Plot area should be between 10 and 100000'
        hasError = true
      }
      
      if(renderShowField(FIELD_NAME.PLOT_AREA) && (dynamicFieldDetails.plotArea && dynamicFieldDetails.plotLength && dynamicFieldDetails.plotWidth && ( (Number(dynamicFieldDetails.plotLength) * Number(dynamicFieldDetails.plotWidth)) > Number(dynamicFieldDetails.plotArea)))){
        updatedError.plotArea = 'Plot Area value is not as per the value of the dimensions'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.LENGTH_WIDTH) && (!dynamicFieldDetails.plotLength || Number(dynamicFieldDetails.plotLength ?? 0) < 1 || Number(dynamicFieldDetails.plotLength) > 10000)){
        updatedError.plotLength = 'Length should be between 1 and 10000'
        hasError = true
      } 

      if(renderShowField(FIELD_NAME.LENGTH_WIDTH) && (!dynamicFieldDetails.plotWidth || Number(dynamicFieldDetails.plotWidth ?? 0) < 1 || Number(dynamicFieldDetails.plotWidth) > 10000)){
        updatedError.plotWidth = 'Width should be between 1 and 10000'
        hasError = true
      }

      if(renderShowField(FIELD_NAME.WIDTH_FACING_ROAD) && (!dynamicFieldDetails.widthOfFacingRoad || Number(dynamicFieldDetails.widthOfFacingRoad ?? 0) < 50 || Number(dynamicFieldDetails.widthOfFacingRoad) > 500)){
        updatedError.widthOfFacingRoad = 'Facing with should be between 50 and 500'
        hasError = true
      }
    }

    if(basicStaticDetails.propertyCategory?.code == 'commercial'){
      
      if(renderShowField(FIELD_NAME.COMMERCIAL_PROPERTY_POSSESSTION_STATUS) && !dynamicFieldDetails.propertyConstructionStatus){
        updatedError.propertyConstructionStatus = 'Please select posession status'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.AVAILABEL_DATE) && !dynamicFieldDetails.possesionDate){
        updatedError.possesionDate = 'Please enter the availabel from date'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.COMMERCIAL_AGE_OF_PROPERTY) && !dynamicFieldDetails.propertyAge || (dynamicFieldDetails.propertyAge && (Number(dynamicFieldDetails.propertyAge) < 0 || Number(dynamicFieldDetails.propertyAge) > 99))){
        updatedError.propertyAge = 'Age of property should be between 0 and 99'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.LOCATION_HUB) && !dynamicFieldDetails.loactionHub){
        updatedError.loactionHub = 'Please select location hub'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.OTHER_LOCATION_HUB) && !dynamicFieldDetails.otherLocationHub){
        updatedError.otherLocationHub = 'Please select other location hub'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.ZONE_TYPE) && !dynamicFieldDetails.zoneType){
        updatedError.zoneType = 'Please select zone type'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.PROPERTY_CONDITION) && !dynamicFieldDetails.propertyCondition){
        updatedError.propertyCondition = 'Please select property condition'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.COMMERCIAL_BUILT_UP_AREA) && renderOptionalField(FIELD_NAME.COMMERCIAL_BUILT_UP_AREA) && (!dynamicFieldDetails.builtUpArea || (dynamicFieldDetails.builtUpArea && ( Number(dynamicFieldDetails.builtUpArea) < 50 || Number(dynamicFieldDetails.builtUpArea) > 300000)))){
        updatedError.builtUpArea = 'Built up area should be between 50 and 300000'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.COMMERCIAL_CARPET_AREA) && renderOptionalField(FIELD_NAME.COMMERCIAL_CARPET_AREA) && !dynamicFieldDetails.carpetArea){
        updatedError.carpetArea = 'Carpet area is required'
        hasError = true;
      }
      if(renderShowField(FIELD_NAME.COMMERCIAL_CARPET_AREA) && (dynamicFieldDetails.builtUpArea && (Number(dynamicFieldDetails.builtUpArea) <= Number(dynamicFieldDetails.carpetArea)))){
        updatedError.carpetArea = 'Carpet area should less the built up area'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.CONSTRUCTION_STATUS) && !dynamicFieldDetails.constructionStatus){
        updatedError.constructionStatus = 'Please select construction status'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.OWNERSHIP) && !dynamicFieldDetails.ownership){
        updatedError.ownership = 'Please select ownership'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.SUITABLE_FOR) && dynamicFieldDetails.suitableFor.length == 0){
        updatedError.suitableFor = 'Please select Suitable for'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.ENTRANCE_WIDTH) && (!dynamicFieldDetails.entranceWidth || (dynamicFieldDetails.entranceWidth && (Number(dynamicFieldDetails.entranceWidth) < 2 || Number(dynamicFieldDetails.entranceWidth > 18))))){
        updatedError.entranceWidth = 'Entrance width should be between 2 and 18'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.CELLING_HEIGHT) && (!dynamicFieldDetails.cellingHeight || (dynamicFieldDetails.cellingHeight && (Number(dynamicFieldDetails.cellingHeight) < 5 || Number(dynamicFieldDetails.cellingHeight > 40))))){
        updatedError.cellingHeight = 'Celling height should be between 5 and 40'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.WIDTH_OF_FACING_IN_FEET) && (!dynamicFieldDetails.widthOfFacingRoad || dynamicFieldDetails.widthOfFacingRoad == 0)){
        updatedError.widthOfFacingRoad = 'Width of facing road should be between 1 to 1000'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.PLOT_TYPE) && !dynamicFieldDetails.plotType){
        updatedError.plotType = 'Please select Plot type'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.COMMERCIAL_PLOT_ARE) && renderOptionalField(FIELD_NAME.COMMERCIAL_PLOT_ARE) && !dynamicFieldDetails.plotArea){
        updatedError.plotArea = 'Plot area is required'
        hasError = true;
      }

      if(renderShowField(FIELD_NAME.TYPE_OF_CONSTRUCTION) && (dynamicFieldDetails.constructinoDone == 'yes' && dynamicFieldDetails.typeOfConstructionDone.length == 0)){
        updatedError.typeOfConstructionDone = 'Please select construction done'
        hasError = true;
      }

    }

    setErrors(updatedError)
    return {hasError: hasError, errorData: updatedError};
  }

  const renderLoactionHubOption = (type: string) => {
    if(type == 'com-rent-office' || type == 'com-sale-office'){
      return LOCATION_HUB.RENT_OFFICE
    }else if(['com-rent-retail-shop' ,'com-rent-showroom', 'com-rent-warehouse', 'com-sale-retail-shop', 'com-sale-showroom', 'com-sale-warehouse'].includes(type)){
      return LOCATION_HUB.RENT_OTHER
    }
    return []
  }

  const handleOpenAddCustomLocation = (label: string) => {
    setOpenCustomFieldPopup(!openCustomFieldPopup)
    setCustomFieldLabel(label)
  }

  const handleAddCustomLocation = (value: string, label: string) => {
    if(label == 'Society'){
      setBasicStaticDetails((pre) => ({...pre, society: {value: value, label: value, name:value}}))
      setErrors((pre) => ({...pre, society: ''}))
    }
    if(label == 'Locality'){
      setBasicStaticDetails((pre) => ({...pre, locality: {value: value, label: value, name: value}}))
      setErrors((pre) => ({...pre, locality: ''}))
    }
  }

  const handleCloseConfirmationDailog = (isYes: boolean) => {
    if(isYes){
      if(storeUserAction){
        storeUserAction()
        resetPostProperty({propertyId: String(params?.propertyId ?? '')})
      }
      setConfirmationPopup(false)
    }else{
      setConfirmationPopup(false)
      setStoreUserAction(null)
    }
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

  const { mutate: resetPostProperty } = useMutation({
    mutationFn: async (
      payload: resetAPIPayload
    ): Promise<resetAPIResponse> => {
      return await resetPostPropertyApiHandler(payload);
    },
    onSuccess: (response: resetAPIResponse) => {
      dispatch(setTotalProgress({progress: Number(response.progressPercentage ?? 0)}))
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

  const generatePayload = ():Step1PostPropertyPayload => {
    let bhk = {}
    if(dynamicFieldDetails.bhk?.isCustom){
      bhk = {
        id: dynamicFieldDetails.bhk?.id && dynamicFieldDetails.bhk?.id.length > 3 ? dynamicFieldDetails.bhk?.id : null ,
        name: dynamicFieldDetails.bhk.name,
        buildUpAreaSqFt: dynamicFieldDetails.builtUpArea,
        carpetAreaSqFt: dynamicFieldDetails.carpetArea,
        noOfBathrooms: dynamicFieldDetails.bathRooms,
        noOfBedrooms: dynamicFieldDetails.bedRooms,
        balconies: dynamicFieldDetails.balconies,
      }
    }else if(dynamicFieldDetails.bhk?.id == 'other'){
      bhk = {
        id: dynamicFieldDetails.otherBhk?.id && dynamicFieldDetails.otherBhk?.id.length > 3 ? dynamicFieldDetails.otherBhk?.id : null ,
        name: dynamicFieldDetails.otherBhk.name,
        buildUpAreaSqFt: dynamicFieldDetails.builtUpArea,
        carpetAreaSqFt: dynamicFieldDetails.carpetArea,
        noOfBathrooms: dynamicFieldDetails.bathRooms,
        noOfBedrooms: dynamicFieldDetails.bedRooms,
        balconies: dynamicFieldDetails.balconies,
      }
    }else if(dynamicFieldDetails.isStaticBhkDetails && dynamicFieldDetails.staticBhKDetails){
      bhk = {
        id: dynamicFieldDetails.bhk?.id && dynamicFieldDetails.bhk?.id.length > 3 ? dynamicFieldDetails.bhk?.id : null ,
        name: dynamicFieldDetails.staticBhKDetails?.name,
        buildUpAreaSqFt: dynamicFieldDetails.builtUpArea,
        carpetAreaSqFt: dynamicFieldDetails.carpetArea,
        noOfBathrooms: dynamicFieldDetails.bathRooms,
        noOfBedrooms: dynamicFieldDetails.bedRooms,
        balconies: dynamicFieldDetails.balconies,
      }
    }else if(dynamicFieldDetails.isStaticBhkDetails){
      bhk = {
        id: dynamicFieldDetails.bhk?.id && dynamicFieldDetails.bhk?.id.length > 3 ? dynamicFieldDetails.bhk?.id : null ,
        name: dynamicFieldDetails?.bhk?.name,
        buildUpAreaSqFt: dynamicFieldDetails.builtUpArea,
        carpetAreaSqFt: dynamicFieldDetails.carpetArea,
        noOfBathrooms: dynamicFieldDetails.bathRooms,
        noOfBedrooms: dynamicFieldDetails.bedRooms,
        balconies: dynamicFieldDetails.balconies,
      }
    }else if(dynamicFieldDetails.bhk?.name){
      bhk = {
        id: dynamicFieldDetails.bhk?.id && dynamicFieldDetails.bhk?.id.length > 3 ? dynamicFieldDetails.bhk?.id : null ,
        name: dynamicFieldDetails?.bhk?.name,
        buildUpAreaSqFt: dynamicFieldDetails.builtUpArea,
        carpetAreaSqFt: dynamicFieldDetails.carpetArea,
        noOfBathrooms: dynamicFieldDetails.bathRooms,
        noOfBedrooms: dynamicFieldDetails.bedRooms,
        balconies: dynamicFieldDetails.balconies,
      }
    }
    return {
      ...(params?.propertyId ? {propertyId: String(params?.propertyId)} : {}),
      listingTypeId: basicStaticDetails.propertyListFor?.id,
      categoryId: basicStaticDetails.propertyCategory?.id,
      propertyTypeId: basicStaticDetails.propertyType?.id,
      
      city: {
        name: basicStaticDetails.city?.name,
        ...((basicStaticDetails.city?.id && basicStaticDetails.city?.source != 'google') ? {id: basicStaticDetails.city?.id} : {}),
        ...(basicStaticDetails.city?.state ? {state: basicStaticDetails.city?.state} : {}),
        ...(basicStaticDetails.city?.latitude ? {latitude: basicStaticDetails.city?.latitude} : {}),
        ...(basicStaticDetails.city?.longitude ? {longitude: basicStaticDetails.city?.longitude} : {}),
      },

      society : {
        name: basicStaticDetails.society?.name,
        localityName: basicStaticDetails.locality?.label,
        ...((basicStaticDetails.society?.id && basicStaticDetails.society?.source != 'google') ? {id: basicStaticDetails.society?.id} : {}),
        ...(basicStaticDetails.society?.address ? {address: basicStaticDetails.society?.address} : {}),
        ...(basicStaticDetails.society?.latitude ? {latitude: basicStaticDetails.society?.latitude} : {}),
        ...(basicStaticDetails.society?.longitude ? {longitude: basicStaticDetails.society?.longitude} : {}),
      },

      locality: {
        name: basicStaticDetails.locality?.name,
        ...((basicStaticDetails.locality?.id && basicStaticDetails.city?.source != 'google') ? {
          id: basicStaticDetails.locality?.id,
          sector: basicStaticDetails.locality?.sector,
          latitude: basicStaticDetails.locality?.latitude,
          longitude: basicStaticDetails.locality?.longitude
        } : {})
      },

      bhk: bhk,

      transactionType: dynamicFieldDetails.transactionType,
      constructionStatus: dynamicFieldDetails.propertyConstructionStatus,
      ageOfProperty: dynamicFieldDetails.propertyAge,
      possessionDate: dynamicFieldDetails.possesionDate,
      possessionTime: '',
      facing: dynamicFieldDetails.facing,
      status: dynamicFieldDetails?.status ? dynamicFieldDetails?.status : 'draft',
      plotArea: dynamicFieldDetails.plotArea,
      plotAreaUnit: dynamicFieldDetails.selectAreaUnit,
      plotLength: dynamicFieldDetails.plotLength,
      plotLengthUnit: dynamicFieldDetails.plotLenghtUnit,
      plotWidth: dynamicFieldDetails?.plotWidth  ? dynamicFieldDetails?.plotWidth : dynamicFieldDetails?.plotBreadth,
      plotWidthUnit: dynamicFieldDetails.plotWidthUnit,
      plotFacingRoadWidth: dynamicFieldDetails.widthOfFacingRoad,

      locationHub: dynamicFieldDetails?.loactionHub,
      otherLocationHub: dynamicFieldDetails?.otherLocationHub,
      zoneType: dynamicFieldDetails?.zoneType,
      propertyCondition: dynamicFieldDetails?.propertyCondition,
      builtUpArea: dynamicFieldDetails?.builtUpArea,
      builtUpAreaUnit: dynamicFieldDetails.builtUpAreaUnit, //sq_ft, sq_yd, sq_m, acres, hectares
      carpetArea: dynamicFieldDetails?.carpetArea ?? 0,
      carpetAreaUnit: dynamicFieldDetails.carpetAreaUnit, //sq_ft, sq_yd, sq_m, acres, hectares
      wallConstructionStatus: dynamicFieldDetails?.constructionStatus,
      ownership: dynamicFieldDetails?.ownership,
      suitableFor: dynamicFieldDetails?.suitableFor,
      entranceWidth: dynamicFieldDetails?.entranceWidth,
      entranceWidthUnit: dynamicFieldDetails.entranceWidthUnit,// ft, m, in, cm
      ceilingHeight: dynamicFieldDetails?.cellingHeight,
      ceilingHeightUnit: dynamicFieldDetails.ceilingHeightUnit, // ft, m, in, cm
      locatedNear: dynamicFieldDetails?.locatedNear,
      plotLandType: dynamicFieldDetails?.plotType,
      noOfOpenSides: dynamicFieldDetails?.openSide,
      constructionDone: dynamicFieldDetails?.constructinoDone,
      constructionTypeOptions: dynamicFieldDetails?.typeOfConstructionDone
    }
  }

  const { mutate: handleStep1Submit, isPending: step1Loader } = useMutation({
    mutationFn: async (
      payload: Step1PostPropertyPayload
    ): Promise<Step1PostPropertyResponse> => {
      return await step1PostPropertyCreateApiHandler(payload);
    },
    onSuccess: (response: Step1PostPropertyResponse) => {
      let propertyId = response.id
      dispatch(setActiveStep({step: activeStep + 1}))
      router.push(`/post-property/${propertyId}?continueCreate=true`)
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

  const { data: step1Details, isPending: step1DetailsLoader } = useQuery({
    queryKey: ["step1-details", params?.propertyId],
    queryFn: async (): Promise<Step1DetailsResponse> => {
      return step1PostPropertyDetailsApiHandler(String(params?.propertyId ?? ''));
    },
    select: (resposne: Step1DetailsResponse) => {
      return resposne
    },
    enabled: params?.propertyId ? true : false,
    staleTime: 0,
    refetchOnMount: true
  });
  useEffect(() => {
    if(step1Details){
      setBasicStaticDetails((pre) => ({
          ...pre,
          propertyListFor: step1Details?.listingType,
          propertyCategory: step1Details?.category,
          propertyType: step1Details?.propertyType,
          city: {...step1Details?.city, value: step1Details?.city?.id || step1Details?.city?.name, label: step1Details?.city?.name},
          society: {...step1Details?.society, value: step1Details?.society?.id || step1Details?.society?.name, label: step1Details?.society?.name, name: step1Details?.society?.name},
          locality: {...step1Details?.locality, value: step1Details?.locality?.id || step1Details?.locality?.name, label: step1Details?.locality?.name, name: step1Details?.locality?.name}
      }))

      let num = step1Details?.bhk?.name.match(/[\d.]+/)?.[0] || "2"
      setDynamicFieldDetails((pre) => ({
        ...pre,
        ...(step1Details?.bhk?.name ? {bhk: {...step1Details?.bhk, bhk: Math.ceil(Number(num)), isCustom: true}} : ''),
        otherBhk: null,
        isStaticBhkDetails: false,
        staticBhKDetails: null,
        builtUpArea: step1Details?.bhk?.buildUpAreaSqFt ? step1Details?.bhk?.buildUpAreaSqFt : step1Details.builtUpArea,
        carpetArea: step1Details?.bhk?.carpetAreaSqFt ? step1Details?.bhk?.carpetAreaSqFt : step1Details?.carpetArea,
        bathRooms: step1Details?.bhk?.noOfBathrooms,
        bedRooms: step1Details?.bhk?.noOfBedrooms,
        balconies: step1Details?.bhk?.balconies,
        facing: step1Details?.facing,

        plotArea: step1Details?.plotArea,
        selectAreaUnit: step1Details?.plotAreaUnit,
        plotLength: step1Details?.plotLength,
        plotWidth: step1Details?.plotWidth,
        widthOfFacingRoad: step1Details?.plotFacingRoadWidth,

        transactionType: TRANSACTION_TYPE_LIST.find(item => item.value == step1Details.transactionType)?.value,
        propertyConstructionStatus: PROPERTY_CONSTRUCTION_STATUS.find(item => item.value == step1Details.constructionStatus)?.value,
        propertyAge: step1Details?.ageOfProperty,
        possesionDate: step1Details?.possessionDate,
        status: step1Details?.status ?? '',

        loactionHub: step1Details.locationHub,
        otherLocationHub: step1Details.otherLocationHub,
        zoneType: step1Details.zoneType,
        propertyCondition: step1Details.propertyCondition,
        builtUpAreaUnit: step1Details.builtUpAreaUnit, //sq_ft, sq_yd, sq_m, acres, hectares
        carpetAreaUnit: step1Details.carpetAreaUnit,
        constructionStatus: step1Details.wallConstructionStatus,
        ownership: step1Details.ownership,
        suitableFor: step1Details.suitableFor,
        entranceWidth: step1Details.entranceWidth ? parseInt(String(step1Details.entranceWidth), 10) : null,
        entranceWidthUnit: step1Details.entranceWidthUnit,
        cellingHeight: step1Details.ceilingHeight ? parseInt(String(step1Details.ceilingHeight), 10) : null,
        ceilingHeightUnit: step1Details.ceilingHeightUnit,
        locatedNear: step1Details.locatedNear,
        plotType: step1Details.plotLandType,
        openSide: step1Details.noOfOpenSides,
        constructinoDone: step1Details.constructionDone,
        typeOfConstructionDone: step1Details.constructionTypeOptions,
        plotBreadth: step1Details.plotWidth,

      }))

      dispatch(setTotalProgress({progress: step1Details.progressPercentage}))

    }
  },[step1Details])

  // useEffect(() => {
  //   calculateProgress()
  // }, [dynamicFieldDetails, basicStaticDetails])

  useEffect(() => {
    if(propertyTypeList && !params?.propertyId){
      setBasicStaticDetails((pre) => ({
        ...pre,
        propertyListFor: propertyTypeList.find(item => item.name == 'Rent')
      }))
    }
  },[propertyTypeList])

  const { mutate: getUserCurrentCity, isPending: autoDetectLoader } = useMutation({
    mutationFn: async (
      payload: GetUserCurrentCityPayload
    ): Promise<GetUserCurrentCityResponse> => {
      return await gerUserCurrentCityApiHandler(payload.latitude, payload.longitude);
    },
    onSuccess: (response: GetUserCurrentCityResponse) => {
        const data = response.data
        if(Array.isArray(data) && data.length > 0){
          const item = data[0]
          setBasicStaticDetails((pre) => ({...pre, city: {label: item.name, value: item.id || item.name, ...item}}))
          setErrors((pre) => ({...pre, city: ''}))
        }
    },
    onError: (error: any) => {
    },
  });

  const fetchLocation = async () => {
      const location = await getUserCoordinates();
      if (location) {
        getUserCurrentCity({latitude: String(location?.lat ?? ''),longitude: String(location?.lng ?? '')})
      } else {
      }
  };

  // useEffect(() => {
    

  //   if(!params?.propertyId){
  //     fetchLocation();
  //   }
  // },[params?.propertyId])


  return (
    <>
    {(step1DetailsLoader && params?.propertyId) ? <FullscreenSpinner/> :
    
    <>
    <div className="flex flex-col gap-4" ref={containerRef}>
      <p className="text-text-black font-semibold text-lg 2md:text-xl pb-2">
        Basic Details
      </p>

      <div id='propertyListFor' data-field={FIELD_NAME.LISTING_FOR} data-has-value={!!basicStaticDetails.propertyListFor}>
        {Array.isArray(propertyTypeList) && <FieldLabel label="Property Listing For"  required={true}/>}
        <div className="flex flex-wrap gap-3 pt-2">
          {Array.isArray(propertyTypeList) &&
            propertyTypeList.map((item: PropertyType) => {
              return(
                <ChipTag
                  checked={item.code == basicStaticDetails.propertyListFor?.code}
                  label={item.name === 'Sale' ? 'Sell' : item.name === 'Rent' ? 'Rent/Lease' : item.name}
                  onChagne={() => {
                    if(basicStaticDetails?.propertyListFor?.code == item.code) return
                    const initialFn = () => {
                      setBasicStaticDetails((pre) => ({...pre, propertyListFor: item, propertyType: null, city: null, locality: null, society: null}))
                      setDynamicFieldDetails(initialState)
                      setErrors((pre) => ({...pre, propertyListFor: ''}))
                      dispatch(setStep1Data({propertyType: null}))
                    }

                    if(params?.propertyId && totalProgress != 0){
                      setConfirmationPopup(true)
                      setStoreUserAction(() => initialFn)
                    }else{
                      initialFn()
                    }
                  }}
                  value={item.id}
                  iconSrc={item.icon}
                  isIcon={true}
                  containerStyle="flex flex-1 2md:flex-none justify-start gap-2 min-w-[100px] 2md:min-w-[180px]"
                />
              )
            })
          }
        </div>
        {errors?.propertyListFor && <p className="pt-1 text-red-500 text-xs">{errors.propertyListFor}</p>}
      </div>

      <div id='propertyCategory' data-field={FIELD_NAME.PROPERTY_CATEGORY} data-has-value={!!basicStaticDetails.propertyCategory}>
        {Array.isArray(propertyCategoryList) && <FieldLabel label="Property Category" required={true}/>}
        <div className="flex flex-wrap gap-3 pt-2">
          {Array.isArray(propertyCategoryList) && 
            propertyCategoryList.map((item: PropertyCategory) => {
              return(
                <ChipTag
                  checked={item.code == basicStaticDetails.propertyCategory?.code}
                  label={item.name}
                  onChagne={() => {
                    if(basicStaticDetails?.propertyCategory?.code == item.code) return
                    const initialFn = () => {
                      setBasicStaticDetails((pre) => ({...pre, propertyCategory: item, propertyType: null, city: null, locality: null, society: null}))
                      setDynamicFieldDetails(initialState)
                      setErrors((pre) => ({...pre, propertyCategory: ''}))
                      dispatch(setStep1Data({propertyType: null}))
                    }
                    if(params?.propertyId && totalProgress != 0){
                      setConfirmationPopup(true)
                      setStoreUserAction(() => initialFn)
                    }else{
                      initialFn()
                    }
                  }}
                  value={item.id}
                  iconSrc={item.icon}
                  isIcon={true}
                  containerStyle="flex flex-1 2md:flex-none justify-start gap-2 min-w-[100px] 2md:min-w-[180px]"
                />
              )
            })
          }
        </div>
        {errors?.propertyCategory && <p className="pt-1 text-red-500 text-xs">{errors.propertyCategory}</p>}
      </div>

      {renderShowField(FIELD_NAME.PROPERTY_TYPE) && <div data-field={FIELD_NAME.PORPERTY_TYPE} data-has-value={!!basicStaticDetails.propertyType}>
        <FieldLabel label="Property Type" customClass="pb-2" required={true}/>
        <div id='propertyType' className="flex flex-wrap gap-3">
          {Array.isArray(propertyList) && propertyList.map((item, index) => {
            return (
              <button
                className={`cursor-pointer min-w-[120px] 2md:w-[120px] px-3 pt-3 min-h-[90px] flex flex-1 2md:flex-none flex-col items-center gap-1 border border-border border-1 rounded-[10px] ${
                  item.id == basicStaticDetails.propertyType?.id ? "bg-light-purple font-medium" : "text-[#888888]"
                }`}
                onClick={() => {
                  if(basicStaticDetails?.propertyType?.code == item.code) return
                  const initialFn = () => {
                      setBasicStaticDetails((pre) => ({...pre, propertyType: item, city: null, locality: null, society: null}))
                      fetchLocation()
                      setDynamicFieldDetails(initialState)
                      setErrors((pre) => ({...pre, propertyType: ''}))
                      dispatch(setStep1Data({propertyType: item}))
                    }
                    if(params?.propertyId && totalProgress != 0){
                      setConfirmationPopup(true)
                      setStoreUserAction(() => initialFn)
                    }else{
                      initialFn()
                    }
                }}
                key={item.id}
              >
                <item.icon className="w-6 h-6" />
                <p className="text-text-black text-sm text-center">
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>
        {errors?.propertyType && <p className="pt-1 text-red-500 text-xs">{errors.propertyType}</p>}
      </div>}

      {/* Dyname Residential Flow Field Start*/}

      <div id='city' data-field={FIELD_NAME.CITY} data-has-value={!!basicStaticDetails.city}>
        <FieldLabel label="City" customClass="pb-2" required={true}/>
        {/* <DynamicAsyncSelect
          isMulti={false}
          isError={false}
          placeholder={<CityPlaceholder />}
          onChange={(value) => {
            setBasicStaticDetails((pre) => ({...pre, city: value, locality: null, society: null}))
            setErrors((pre) => ({...pre, city: ''}))
          }}
          loadOptions={loadCities}
          value={basicStaticDetails.city}
          minHeight={"40px"}
        /> */}
        <DynamicAsyncAutocomplete
          isMulti={false}
          isError={false}
          placeholder={'Search city'}
          onChange={(value) => {
            setBasicStaticDetails((pre) => ({...pre, city: value, locality: null, society: null}))
            setErrors((pre) => ({...pre, city: ''}))
          }}
          loadOptions={loadCities}
          value={basicStaticDetails.city}
          minHeight={"40px"}
        />
        {errors?.city && <p className="pt-1 text-red-500 text-xs">{errors.city}</p>}
        {autoDetectLoader ? <p className="text-blue text-xs">Auto Detecting City...</p> : ''}
      </div>

      <div id='society' data-field={FIELD_NAME.SOCIETY} data-has-value={!!basicStaticDetails.society}>
        <FieldLabel
          label="Building / Apartment / Society Name"
          customClass="pb-2"
          required={renderOptionalField(FIELD_NAME.SOCIETY)}
        />
        {/* <DynamicAsyncSelect
          isMulti={false}
          isError={false}
          placeholder={"Enter Building / Apartment / Society Name"}
          onChange={(value) => {
            if(!Array.isArray(value) && (value as OptionType)?.value == '__add_manually__'){
              handleOpenAddCustomLocation('Society')
              return
            }
            setBasicStaticDetails((pre) => ({...pre, society: value, locality: !Array.isArray(value) && value && "localityName" in value && value.localityName ? {value: value?.localityName, label: value?.localityName} : null}))
            setErrors((pre) => ({...pre, society: '', locality: !Array.isArray(value) && value && "localityName" in value && value.localityName ?  '' : errors?.localityName ?? ''}))
            setBhkList(generateBHKList(false))
            setDynamicFieldDetails((pre) => ({...pre, bhk: null, otherBhk: null}))
          }}
          loadOptions={(inputSearch: string) => loadBuildings({query: inputSearch, cityId: basicStaticDetails.city?.id ?? '', cityName: basicStaticDetails.city?.name})}
          value={basicStaticDetails.society}
          minHeight={"40px"}
          enableAddManually={true}
          menualAddItem={{ value: "__add_manually__",
          label: `Can't find your Building / Apartment / Society? Add Manually`,}}
        /> */}
        <DynamicAsyncAutocomplete
          isMulti={false}
          isError={false}
          placeholder={"Enter Building / Apartment / Society Name"}
          onChange={(value) => {
            if(!Array.isArray(value) && (value as OptionType)?.value == '__add_manually__'){
              handleOpenAddCustomLocation('Society')
              return
            }
            setBasicStaticDetails((pre) => ({...pre, society: value, locality: !Array.isArray(value) && value && "localityName" in value && value.localityName ? {value: value?.localityName, label: value?.localityName, name: value?.localityName} : null}))
            setErrors((pre) => ({...pre, society: '', locality: !Array.isArray(value) && value && "localityName" in value && value.localityName ?  '' : errors?.localityName ?? ''}))
            setBhkList(generateBHKList(false))
            setDynamicFieldDetails((pre) => ({...pre, bhk: null, otherBhk: null}))
          }}
          loadOptions={(inputSearch: string) => loadBuildings({query: inputSearch, cityId: basicStaticDetails.city?.id ?? '', cityName: basicStaticDetails.city?.name})}
          value={basicStaticDetails.society}
          minHeight={"40px"}
          enableAddManually={true}
          menualAddItem={{ value: "__add_manually__",
          label: `Can't find your Building / Apartment / Society?`,}}
        />
        {renderOptionalField(FIELD_NAME.SOCIETY) && errors?.society && <p className="pt-1 text-red-500 text-xs">{errors.society}</p>}
      </div>

      <div id='locality' data-field={FIELD_NAME.LOCALITY} data-has-value={!!basicStaticDetails.locality}>
        <FieldLabel label="Locality / Sector" customClass="pb-2" required={true}/>
        {/* <DynamicAsyncSelect
          isMulti={false}
          isError={false}
          placeholder={"Enter Locality / Sector"}
          onChange={(value) => {
            if(!Array.isArray(value) && (value as OptionType)?.value == '__add_manually__'){
              handleOpenAddCustomLocation('Locality')
              return
            }
            setBasicStaticDetails((pre) => ({...pre, locality: value, society: !value ? null : basicStaticDetails.society}))
            setErrors((pre) => ({...pre, locality: ''}))
          }}
          loadOptions={async() => []}
          value={basicStaticDetails.locality}
          minHeight={"40px"}
          enableAddManually={true}
          menualAddItem={{ value: "__add_manually__",
          label: `Can't find your Locality / Sector? Add Manually`,}}
        /> */}
        <DynamicAsyncAutocomplete
          isMulti={false}
          isError={false}
          placeholder={"Enter Locality / Sector"}
          onChange={(value) => {
            if(!Array.isArray(value) && (value as OptionType)?.value == '__add_manually__'){
              handleOpenAddCustomLocation('Locality')
              return
            }
            setBasicStaticDetails((pre) => ({...pre, locality: value}))
            setErrors((pre) => ({...pre, locality: ''}))
          }}
          loadOptions={(inputSearch: string) => {
            if (basicStaticDetails.society) {
              return Promise.resolve([]);
            }
            // load localities normally
            return loadLocalities({
              query: inputSearch,
              cityId: basicStaticDetails.city?.id ?? "",
              cityName: basicStaticDetails.city?.name,
            });
          }}
          value={basicStaticDetails.locality}
          minHeight={"40px"}
          enableAddManually={true}
          menualAddItem={{ value: "__add_manually__",
          label: `Can't find your Locality / Sector?`,}}
        />
        {errors?.locality && <p className="pt-1 text-red-500 text-xs">{errors.locality}</p>}
      </div>

      {renderShowField(FIELD_NAME.BHK) && <div id='bhk' data-field={FIELD_NAME.BHK} data-has-value={!!dynamicFieldDetails.bhk}>
        <FieldLabel label="Rooms / BHK" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
          {returnBhkList().map((item) => {
            return(
              <ChipTag
                checked={item.name == dynamicFieldDetails.bhk?.name}
                label={item.name}
                onChagne={() => {
                  if(item?.isPlusItem){
                    setBhkList(generateBHKList(true))
                    return
                  }else{
                    setDynamicFieldDetails((pre) => ({...pre, bhk: item, otherBhk: null, isStaticBhkDetails: false, staticBhKDetails: null, builtUpArea: null, carpetArea: null, bathRooms: null, bedRooms: null, balconies: null}))
                    setErrors((pre) => ({...pre, bhk: ''}))
                  }
                }}
                value={item.id}
                isIcon={false}
                containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[130px]"
              />
            )
          })
          }
        </div>
          {errors?.bhk && <p className="pt-1 text-red-500 text-xs">{errors.bhk}</p>}
      </div>}

      {renderShowField(FIELD_NAME.OTHERBHK) && <div id='otherBhk' data-field={FIELD_NAME.OTHERBHK} data-has-value={!!dynamicFieldDetails.otherBhk}>
        <FieldLabel label="Choose BHK" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
          <DynamicSelect
            isMulti={false}
            isError={false}
            placeholder={'Select BHK'}
            onChange={(value) => {
              setDynamicFieldDetails((pre) => ({...pre, otherBhk: value, isStaticBhkDetails: false, staticBhKDetails: null, builtUpArea: null, carpetArea: null, bathRooms: null, bedRooms: null, balconies: null}))
            setErrors((pre) => ({...pre, otherBhk: ''}))
            }}
            options={renderOtherBhk()}
            value={dynamicFieldDetails.otherBhk}
            minHeight={"40px"}
            fontwidth={'16px'}
          />
        </div>
          {errors?.otherBhk && <p className="pt-1 text-red-500 text-xs">{errors.otherBhk}</p>}
      </div>}

      {Array.isArray(dynamicBhkList) && dynamicBhkList.length > 0 && Array.isArray(dynamicFieldDetails.bhk?.builtUpAreas) && dynamicFieldDetails.bhk?.builtUpAreas.length > 0 && <div>
        <div className="flex flex-wrap gap-3 pt-2 items-stretch">
          {
            dynamicFieldDetails.bhk?.builtUpAreas.map((item) => {
              return(
                <div onClick={() => {
                  setDynamicFieldDetails((pre) => ({
                    ...pre, isStaticBhkDetails: true, staticBhKDetails: item, carpetArea: item?.carpetArea, bathRooms: item?.noOfBathrooms, bedRooms: item?.noOfBedrooms, balconies: item?.balconies, 
                  }))
                  setErrors((pre) => ({...pre, builtUpArea: '', bathRooms: '', bedRooms: '', balconies: ''}))
                }} className={`flex flex-1 min-w-[240px] justify-between cursor-pointer ${(dynamicFieldDetails.isStaticBhkDetails && (dynamicFieldDetails.staticBhKDetails?.id == item?.id)) ? 'bg-light-purple' : ''} p-3 border border-border border-1 rounded-[10px] gap-5`}>
                  <div className="flex flex-col justify-between">
                      <p className="font-medium text-sm text-text-black">{item.superBuiltUpArea} Sq Ft</p>
                      <p className="text-sm text-text-gray">Builtup Area</p>
                      <p className="text-sm text-text-black">{item.noOfBathrooms} Bathrooms</p>
                  </div>
                  <Image alt="home" src='assets/squre-home.svg' width={75} height={75} />
                </div>
              )
            })
          }
            <div onClick={() => {
              setDynamicFieldDetails((pre) => ({...pre, isStaticBhkDetails: true, staticBhKDetails: null, builtUpArea: null, carpetArea: null, bathRooms: null, bedRooms: null, balconies: null}))
            }}  className={`flex flex-1 min-w-[240px] flex-col justify-center cursor-pointer p-3 border border-border border-1 rounded-[10px] text-center ${(dynamicFieldDetails.isStaticBhkDetails && !dynamicFieldDetails.staticBhKDetails) ? 'bg-light-purple' : ''} `}>
              <p className="font-medium text-sm text-text-black">+ Add Here</p>
              <p className="text-sm text-text-gray">My unit is not listed</p>
            </div>
        </div>
      </div>}
      
      {renderShowField(FIELD_NAME.BUILT_UP_AREA) && <div id='builtUpArea' data-field={FIELD_NAME.BUILT_UP_AREA} data-has-value={!!dynamicFieldDetails.builtUpArea}>
        <FieldLabel label="Built Up Area" customClass="pb-2" required={true}/>
        <DynamicInput
           placeHolder='Enter built up area'
           type='number'
           options={AREA_UNIT_LIST}
           onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return
            if(Number(value) > 99999) return
            setDynamicFieldDetails((pre) => ({...pre, builtUpArea: value,builtUpAreaUnit: dropdownValue}))
            setErrors((pre) => ({...pre, builtUpArea: ''}))
           }}
           value={dynamicFieldDetails.builtUpArea ?? ''}
           dropdownValue={dynamicFieldDetails?.builtUpAreaUnit}
           />
          {errors?.builtUpArea && <p className="pt-1 text-red-500 text-xs">{errors.builtUpArea}</p>}
      </div>}

      {renderShowField(FIELD_NAME.CARPET_AREA) && <div id='carpetArea' data-field={FIELD_NAME.CARPET_AREA} data-has-value={!!dynamicFieldDetails.carpetArea}>
        <FieldLabel label="Carpet Area" customClass="pb-2"/>
        <DynamicInput
           placeHolder='Enter carpet area'
            type="number"
           options={AREA_UNIT_LIST}
            onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return
            if(Number(value) > 99999) return
            setDynamicFieldDetails((pre) => ({...pre, carpetArea: value,carpetAreaUnit: dropdownValue}))
            setErrors((pre) => ({...pre, carpetArea: ''}))
           }}
           value={dynamicFieldDetails.carpetArea ?? ''}
           dropdownValue={dynamicFieldDetails?.carpetAreaUnit}
           />
          {errors?.carpetArea && <p className="pt-1 text-red-500 text-xs">{errors.carpetArea}</p>}
      </div>}

      {renderShowField(FIELD_NAME.TRANSACTION_TYPE) && <div id='transactionType' data-field={FIELD_NAME.TRANSACTION_TYPE} data-has-value={!!dynamicFieldDetails.transactionType}>
        <FieldLabel label="Transaction Type" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
           {
            TRANSACTION_TYPE_LIST.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.transactionType}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, transactionType: item.value}))
                    setErrors((pre) => ({...pre, transactionType: ''}))
                  }}
                  value={dynamicFieldDetails.transactionType}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.transactionType && <p className="pt-1 text-red-500 text-xs">{errors.transactionType}</p>}
      </div>}

      {renderShowField(FIELD_NAME.PROPERTY_CONSTRUCTION_STATUS) && <div id='propertyConstructionStatus' data-field={FIELD_NAME.PROPERTY_CONSTRUCTION_STATUS} data-has-value={!!dynamicFieldDetails.propertyConstructionStatus}>
        <FieldLabel label="Construction Status" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
           {
            PROPERTY_CONSTRUCTION_STATUS.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.propertyConstructionStatus}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, propertyConstructionStatus: item.value}))
                    setErrors((pre) => ({...pre, propertyConstructionStatus: ''}))
                  }}
                  value={dynamicFieldDetails.propertyConstructionStatus}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.propertyConstructionStatus && <p className="pt-1 text-red-500 text-xs">{errors.propertyConstructionStatus}</p>}
      </div>}

     {renderShowField(FIELD_NAME.AGE_OF_PROPERTY) && <div id='propertyAge' data-field={FIELD_NAME.AGE_OF_PROPERTY} data-has-value={!!dynamicFieldDetails.propertyAge || dynamicFieldDetails.propertyAge === 0}>
          <FieldLabel label="Age of Property ( In Years)" customClass="pb-2" required={true}/>
          <InputBase
            placeholder="Enter property age"
            fullWidth
            type="number"
            value={dynamicFieldDetails.propertyAge ?? ''}
            onChange={(event) => {
              const input = event.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if(!isOnlyDigits) return
              if(Number(input) > 99) return
              setDynamicFieldDetails((pre) => ({...pre, propertyAge: input}))
              setErrors((pre) => ({...pre, propertyAge: ''}))
            }}
            className='box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border text-text-gray'
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.propertyAge && <p className="pt-1 text-red-500 text-xs">{errors.propertyAge}</p>}
      </div> }

      {renderShowField(FIELD_NAME.POSSESION_DATE) &&
        <div id='possesionDate' data-field={FIELD_NAME.POSSESION_DATE} data-has-value={!!dynamicFieldDetails.possesionDate}>
          <FieldLabel label="Possession Date" customClass="pb-2" required={true}/>
          <div onClick={() => {possessionDateRef.current?.showPicker()}}>
            <InputBase
              inputRef={possessionDateRef}
              placeholder="Selct"
              type="date"
              fullWidth
              onChange={(e) =>{
                setDynamicFieldDetails((pre) => ({...pre, possesionDate: e.target.value}))
                setErrors((pre) => ({...pre, possesionDate: ''}))
              }
              }
              value={dynamicFieldDetails.possesionDate ?? ''}
              className={'box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border focus:border-blue text-text-gray'}
              inputProps={{
                className: "placeholder-gray",
                min: new Date().toISOString().split('T')[0],
              }}
            />
            {errors.possesionDate && (
              <p className="pt-1 text-red-500 text-xs">
                {errors.possesionDate}
              </p>
            )}
          </div>
        </div>
      }

      {renderShowField(FIELD_NAME.BATHTROOMS) && <div id='bathRooms' data-field={FIELD_NAME.BATHTROOMS} data-has-value={!!dynamicFieldDetails.bathRooms}>
        <FieldLabel label="Bathrooms" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
          {
            renderBHKAmeneties().map(item => {
              return(
                <ChipTag
                  checked={item == dynamicFieldDetails.bathRooms}
                  label={item}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, bathRooms: item}))
                    setErrors((pre) => ({...pre, bathRooms: ''}))
                  }}
                  value={item}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                />
              )
            })
          }
        </div>
          {errors?.bathRooms && <p className="pt-1 text-red-500 text-xs">{errors.bathRooms}</p>}
      </div>}

      {renderShowField(FIELD_NAME.BEDROOMS) && <div id='bedRooms' data-field={FIELD_NAME.BEDROOMS} data-has-value={!!dynamicFieldDetails.bedRooms}>
        <FieldLabel label="Bedroom" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
          {
            renderBHKAmeneties().map(item => {
              return(
                <ChipTag
                  checked={item == dynamicFieldDetails.bedRooms}
                  label={item}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, bedRooms: item}))
                    setErrors((pre) => ({...pre, bedRooms: ''}))
                  }}
                  value={item}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                />
              )
            })
          }
        </div>
          {errors?.bedRooms && <p className="pt-1 text-red-500 text-xs">{errors.bedRooms}</p>}
      </div>}

      {renderShowField(FIELD_NAME.BALCONIES) && <div id='balconies' data-field={FIELD_NAME.BALCONIES} data-has-value={!!dynamicFieldDetails.balconies || dynamicFieldDetails.balconies === 0}>
        <FieldLabel label="Balconies" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
          <ChipTag
            checked={0 == dynamicFieldDetails.balconies}
            label={'0'}
            onChagne={() => {
              setDynamicFieldDetails((pre) => ({...pre, balconies: 0}))
              setErrors((pre) => ({...pre, balconies: ''}))
            }}
            value={0}
            isIcon={false}
            containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
          />
          {
            renderBHKAmeneties().map(item => {
              return(
                <ChipTag
                  checked={item == dynamicFieldDetails.balconies}
                  label={item}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, balconies: item}))
                    setErrors((pre) => ({...pre, balconies: ''}))
                  }}
                  value={item}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                />
              )
            })
          }
        </div>
          {errors?.balconies && <p className="pt-1 text-red-500 text-xs">{errors.balconies}</p>}
      </div>}

      {renderShowField(FIELD_NAME.FACING) && <div id='facing' data-field={FIELD_NAME.FACING} data-has-value={!!dynamicFieldDetails.facing}>
        <FieldLabel label="Facing" />
        <div className="flex flex-wrap gap-3 pt-2">
          {
            FACING_LIST.map(item => {
              return(
                <ChipTag
                  checked={item == dynamicFieldDetails.facing}
                  label={item}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, facing: item}))
                  }}
                  value={dynamicFieldDetails.facing}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                />
              )
            })
          }
        </div>
      </div>}

      {renderShowField(FIELD_NAME.PLOT_AREA) && <div id='plotArea' data-field={FIELD_NAME.PLOT_AREA} data-has-value={!!dynamicFieldDetails.plotArea}>
        <FieldLabel label="Plot Area" customClass="pb-2" required={true}/>
        <DynamicInput
           placeHolder='Enter Plot Area'
           type="number"
           options={AREA_UNIT_LIST}
           onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return;
            if(Number(value) > 100000) return
            setDynamicFieldDetails((pre) => ({...pre, plotArea: value, selectAreaUnit: dropdownValue}))
            let isPloatAreaError = errors?.plotArea
            if(value && (Number(dynamicFieldDetails.plotLength) * Number(dynamicFieldDetails.plotWidth)) > Number(value)){
              isPloatAreaError = 'Plot Area value is not as per the value of the dimensions'
            }else{
              isPloatAreaError = ''
            }
            setErrors((pre) => ({...pre, plotArea: isPloatAreaError}))
           }}
           value={dynamicFieldDetails.plotArea ?? ''}
           dropdownValue={dynamicFieldDetails.selectAreaUnit}
           />
          {errors?.plotArea && <p className="pt-1 text-red-500 text-xs">{errors.plotArea}</p>}
      </div>}

      {renderShowField(FIELD_NAME.LENGTH_WIDTH) && <div id='plotLength' className="grid grid-cols-1 2md:grid-cols-2 gap-3">
        <div data-field={'LENGTH'} data-has-value={!!dynamicFieldDetails.plotLength}>
          <FieldLabel
            label="Length"
            customClass="pb-2"
            required={true}
          />
          <InputBase
            placeholder="Enter Plot Length"
            type="number"
            fullWidth
            value={dynamicFieldDetails.plotLength ?? ''}
            onChange={(e) => {
              const input = e.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if (isOnlyDigits){
                setDynamicFieldDetails((pre) => ({...pre, plotLength: input}))
                let isPloatAreaError = errors?.plotArea
                if(dynamicFieldDetails.plotArea && (Number(input) * Number(dynamicFieldDetails.plotWidth)) > dynamicFieldDetails.plotArea){
                  isPloatAreaError = 'Plot Area value is not as per the value of the dimensions'
                }else if(!dynamicFieldDetails.plotArea){
                  isPloatAreaError = 'Plot area should be between 10 and 100000'
                }else{
                  isPloatAreaError = ''
                }
                setErrors((pre) => ({...pre, plotLength: '', plotArea: isPloatAreaError}))
              };
            }}
            className={
              "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
            }
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.plotLength && <p className="pt-1 text-red-500 text-xs">{errors.plotLength}</p>}
        </div>

        <div data-field={'WIDTH'} data-has-value={!!dynamicFieldDetails.plotWidth}>
          <FieldLabel label="Width" customClass="pb-2" required={true} />
          <InputBase
            placeholder="Enter Plot Width"
            fullWidth
            type="number"
            value={dynamicFieldDetails.plotWidth ?? ''}
            onChange={(e) => {
              const input = e.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if (!isOnlyDigits) return;
              setDynamicFieldDetails((pre) => ({...pre, plotWidth: input}))
              let isPloatAreaError = errors?.plotArea
              if(dynamicFieldDetails.plotArea && (Number(input) * Number(dynamicFieldDetails.plotLength)) > dynamicFieldDetails.plotArea){
                isPloatAreaError = 'Plot Area value is not as per the value of the dimensions'
              }else if(!dynamicFieldDetails.plotArea){
                isPloatAreaError = 'Plot area should be between 10 and 100000'
              }else{
                isPloatAreaError = ''
              }
              setErrors((pre) => ({...pre, plotWidth: '', plotArea: isPloatAreaError}))
            }}
            className={
              "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
            }
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.plotWidth && <p className="pt-1 text-red-500 text-xs">{errors.plotWidth}</p>}
        </div>
      </div>}

      {renderShowField(FIELD_NAME.WIDTH_FACING_ROAD) && <div id='widthOfFacingRoad' data-field={FIELD_NAME.WIDTH_FACING_ROAD} data-has-value={!!dynamicFieldDetails.widthOfFacingRoad}>
          <FieldLabel label="Width of Facing Road" customClass="pb-2" required={true}/>
          <InputBase
            placeholder="Enter Plot Facing Road"
            fullWidth
            type="number"
            value={dynamicFieldDetails.widthOfFacingRoad ?? ''}
            onChange={(event) => {
              const input = event.target.value;
              const isOnlyDigits = /^\d*$/.test(input);
              if(!isOnlyDigits) return
              if(Number(input) > 500) return
              setDynamicFieldDetails((pre) => ({...pre, widthOfFacingRoad: input}))
              setErrors((pre) => ({...pre, widthOfFacingRoad: ''}))
            }}
            className='box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border text-text-gray'
            inputProps={{
              className: "placeholder-gray",
            }}
          />
          {errors?.widthOfFacingRoad && <p className="pt-1 text-red-500 text-xs">{errors.widthOfFacingRoad}</p>}
      </div> }

      {/* Dyname Residential Flow Field End*/}

      {/* Dyname Commercial Flow Field Start*/}
      
      {renderShowField('possession_date_section') && <RenderSectionName data={CUSTOM_SECTION_NAME.POSSESSION} customClass="pt-3"/>} 

      {renderShowField(FIELD_NAME.COMMERCIAL_PROPERTY_POSSESSTION_STATUS) && <div id='propertyConstructionStatus' data-field={FIELD_NAME.PROPERTY_CONSTRUCTION_STATUS} data-has-value={!!dynamicFieldDetails.propertyConstructionStatus}>
        <FieldLabel label="Possession status" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            PROPERTY_CONSTRUCTION_STATUS.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.propertyConstructionStatus}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, propertyConstructionStatus: item.value}))
                    setErrors((pre) => ({...pre, propertyConstructionStatus: ''}))
                  }}
                  value={dynamicFieldDetails.propertyConstructionStatus}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.propertyConstructionStatus && <p className="pt-1 text-red-500 text-xs">{errors.propertyConstructionStatus}</p>}
      </div>}

      {(renderShowField(FIELD_NAME.AVAILABEL_DATE) || renderShowField(FIELD_NAME.COMMERCIAL_AGE_OF_PROPERTY)) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
        {renderShowField(FIELD_NAME.AVAILABEL_DATE) &&
        <div id='possesionDate' data-field={FIELD_NAME.AVAILABEL_DATE} data-has-value={!!dynamicFieldDetails.possesionDate}>
          <FieldLabel label="Available From" customClass="pb-2" required={true}/>
          <div className="w-auto" onClick={() => {availabelDateRef.current?.showPicker()}}>
            <InputBase
              inputRef={availabelDateRef}
              placeholder="Selct"
              type="date"
              fullWidth
              onChange={(e) =>{
                setDynamicFieldDetails((pre) => ({...pre, possesionDate: e.target.value}))
                setErrors((pre) => ({...pre, possesionDate: ''}))
              }
              }
              value={dynamicFieldDetails.possesionDate ?? ''}
              className={'box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border focus:border-blue text-text-gray'}
              inputProps={{
                className: "placeholder-gray",
                min: new Date().toISOString().split('T')[0],
              }}
            />
            {errors.possesionDate && (
              <p className="pt-1 text-red-500 text-xs">
                {errors.possesionDate}
              </p>
            )}
          </div>
        </div>
        }
        {renderShowField(FIELD_NAME.COMMERCIAL_AGE_OF_PROPERTY) && <div id='propertyAge' data-field={FIELD_NAME.AGE_OF_PROPERTY} data-has-value={!!dynamicFieldDetails.propertyAge || dynamicFieldDetails.propertyAge === 0}>
            <FieldLabel label="Age of Property ( in Years)" customClass="pb-2" required={true}/>
            <InputBase
              placeholder="Enter property age"
              fullWidth
              type="number"
              value={dynamicFieldDetails.propertyAge ?? ''}
              onChange={(event) => {
                const input = event.target.value;
                const isOnlyDigits = /^\d*$/.test(input);
                if(!isOnlyDigits) return
                if(Number(input) > 99) return
                setDynamicFieldDetails((pre) => ({...pre, propertyAge: input}))
                setErrors((pre) => ({...pre, propertyAge: ''}))
              }}
              className='box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border text-text-gray'
              inputProps={{
                className: "placeholder-gray",
              }}
            />
            {errors?.propertyAge && <p className="pt-1 text-red-500 text-xs">{errors.propertyAge}</p>}
        </div> }
      </div>}
      
      {renderShowField('about_property_section') && <RenderSectionName data={CUSTOM_SECTION_NAME.ABOUT_THE_PROPERTY} customClass="pt-3"/> }
      
      {renderShowField(FIELD_NAME.PLOT_TYPE) && <div id='plotType' data-field={FIELD_NAME.PLOT_TYPE} data-has-value={!!dynamicFieldDetails.plotType}>
        <FieldLabel label="Plot/Land Type" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            PLOT_LAND_TYPE.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.plotType}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, plotType: item.value}))
                    setErrors((pre) => ({...pre, plotType: ''}))
                  }}
                  value={dynamicFieldDetails.plotType}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.plotType && <p className="pt-1 text-red-500 text-xs">{errors.plotType}</p>}
      </div>}

      {renderShowField(FIELD_NAME.SUITABLE_FOR) && <div id='suitableFor' data-field={FIELD_NAME.SUITABLE_FOR} data-has-value={!!dynamicFieldDetails.suitableFor}>
        <FieldLabel label="Suitable For" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            SUITABLE_FOR.map((item) => {
              return(
                <ChipTag
                  checked={dynamicFieldDetails.suitableFor?.includes(item.value)}
                  label={item.name}
                  onChagne={() => {
                    let data = []
                    const isavailable = dynamicFieldDetails.suitableFor.find(type => type == item.value)
                    if(isavailable){
                      data = dynamicFieldDetails.suitableFor.filter(type => type != item.value)
                    }else{
                      data = [...dynamicFieldDetails.suitableFor, item.value]
                    }
                    setDynamicFieldDetails((pre) => ({...pre, suitableFor: data}))
                    setErrors((pre) => ({...pre, suitableFor: ''}))
                  }}
                  value={item.name}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.suitableFor && <p className="pt-1 text-red-500 text-xs">{errors.suitableFor}</p>}
      </div>}

      {renderShowField(FIELD_NAME.LOCATION_HUB) && <div id='loactionHub' data-field={FIELD_NAME.PROPERTY_CONSTRUCTION_STATUS} data-has-value={!!dynamicFieldDetails.loactionHub}>
        <FieldLabel label="Location Hub" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            renderLoactionHubOption(basicStaticDetails.propertyType?.code ?? '').map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.loactionHub}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, loactionHub: item.value}))
                    setErrors((pre) => ({...pre, loactionHub: ''}))
                  }}
                  value={dynamicFieldDetails.loactionHub}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.loactionHub && <p className="pt-1 text-red-500 text-xs">{errors.loactionHub}</p>}
      </div>}

      {renderShowField(FIELD_NAME.OTHER_LOCATION_HUB) && <div id='otherLocationHub' data-field={FIELD_NAME.OTHER_LOCATION_HUB} data-has-value={!!dynamicFieldDetails.otherLocationHub}>
        <FieldLabel label="Other (Location Hub)" required={true} customClass="pb-2"/>
          <InputBase
            placeholder="Enter location hub"
            fullWidth
            value={dynamicFieldDetails.otherLocationHub ?? ''}
            onChange={(e) => {
              setDynamicFieldDetails((pre) => ({...pre, otherLocationHub: e.target.value}))
              setErrors((pre) => ({...pre, otherLocationHub: ''}))
            }}
            className={
              "box-border px-4 py-2 text-sm rounded-full border focus:outline-none border-border text-text-gray h-[40px]"
            }
            inputProps={{
              className: "placeholder-gray",
            }}
          />
        {errors?.otherLocationHub && <p className="pt-1 text-red-500 text-xs">{errors.otherLocationHub}</p>}
      </div>}

      {renderShowField(FIELD_NAME.ZONE_TYPE) && <div id='zoneType' data-field={FIELD_NAME.ZONE_TYPE} data-has-value={!!dynamicFieldDetails.zoneType}>
        <FieldLabel label="Zone Type" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            ZONE_TYPE.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.zoneType}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, zoneType: item.value}))
                    setErrors((pre) => ({...pre, zoneType: ''}))
                  }}
                  value={dynamicFieldDetails.zoneType}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.zoneType && <p className="pt-1 text-red-500 text-xs">{errors.zoneType}</p>}
      </div>}

      {renderShowField(FIELD_NAME.PROPERTY_CONDITION) && <div id='propertyCondition' data-field={FIELD_NAME.PROPERTY_CONDITION} data-has-value={!!dynamicFieldDetails.propertyCondition}>
        <FieldLabel label="Property Condition" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            PROPERTY_CONDITION.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.propertyCondition}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, propertyCondition: item.value}))
                    setErrors((pre) => ({...pre, propertyCondition: ''}))
                  }}
                  value={dynamicFieldDetails.propertyCondition}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.propertyCondition && <p className="pt-1 text-red-500 text-xs">{errors.propertyCondition}</p>}
      </div>}
      
      {renderShowField(FIELD_NAME.COMMERCIAL_PLOT_ARE) && <div id='plotArea' data-field={FIELD_NAME.COMMERCIAL_PLOT_ARE} data-has-value={!!dynamicFieldDetails.plotArea}>
        <FieldLabel label="Plot Area" customClass="pb-2" required={renderOptionalField(FIELD_NAME.COMMERCIAL_PLOT_ARE)}/>
        <DynamicInput
           placeHolder='Enter plot area'
           type="number"
           options={AREA_UNIT_LIST}
           onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return
            if(Number(value) > 100000) return
            setDynamicFieldDetails((pre) => ({...pre, plotArea: value,selectAreaUnit: dropdownValue}))
            setErrors((pre) => ({...pre, plotArea: ''}))
           }}
           value={dynamicFieldDetails.plotArea ??''}
           dropdownValue={dynamicFieldDetails.selectAreaUnit}
           />
          {errors?.plotArea && <p className="pt-1 text-red-500 text-xs">{errors.plotArea}</p>}
      </div>}

      {(renderShowField(FIELD_NAME.COMMERCIAL_BUILT_UP_AREA) || renderShowField(FIELD_NAME.COMMERCIAL_CARPET_AREA) )&& <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
        {renderShowField(FIELD_NAME.COMMERCIAL_BUILT_UP_AREA) && <div id='builtUpArea' data-field={FIELD_NAME.COMMERCIAL_BUILT_UP_AREA} data-has-value={!!dynamicFieldDetails.builtUpArea}>
        <FieldLabel label="Built Up Area" customClass="pb-2" required={renderOptionalField(FIELD_NAME.COMMERCIAL_BUILT_UP_AREA)}/>
        <DynamicInput
           placeHolder='Enter built up area'
           type='number'
           options={AREA_UNIT_LIST}
           onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return
            if(Number(value) > 99999) return
            setDynamicFieldDetails((pre) => ({...pre, builtUpArea: value,builtUpAreaUnit: dropdownValue}))
            setErrors((pre) => ({...pre, builtUpArea: ''}))
           }}
           value={dynamicFieldDetails.builtUpArea ?? ''}
           dropdownValue={dynamicFieldDetails.builtUpAreaUnit}
           />
          {errors?.builtUpArea && <p className="pt-1 text-red-500 text-xs">{errors.builtUpArea}</p>}
        </div>}

        {renderShowField(FIELD_NAME.COMMERCIAL_CARPET_AREA) && <div id='carpetArea' data-field={FIELD_NAME.COMMERCIAL_CARPET_AREA} data-has-value={!!dynamicFieldDetails.carpetArea}>
          <FieldLabel label="Carpet Area" customClass="pb-2" required={renderOptionalField(FIELD_NAME.COMMERCIAL_CARPET_AREA)}/>
          <DynamicInput
            placeHolder='Enter carpet area'
            type="number"
            options={AREA_UNIT_LIST}
            onChange={(value: string, dropdownValue: string) => {
              const isOnlyDigits = /^\d*$/.test(value);
              if(!isOnlyDigits) return
              setDynamicFieldDetails((pre) => ({...pre, carpetArea: value,carpetAreaUnit: dropdownValue}))
              setErrors((pre) => ({...pre, carpetArea: ''}))
            }}
            value={dynamicFieldDetails.carpetArea ?? ''}
            dropdownValue={dynamicFieldDetails.carpetAreaUnit}
            />
            {errors?.carpetArea && <p className="pt-1 text-red-500 text-xs">{errors.carpetArea}</p>}
        </div>}
      </div>}

      {(renderShowField(FIELD_NAME.PLOT_LENGTH) || renderShowField(FIELD_NAME.PLOT_BREADTH)) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
        {renderShowField(FIELD_NAME.PLOT_LENGTH) && <div id='plotLength' data-field={FIELD_NAME.PLOT_LENGTH} data-has-value={!!dynamicFieldDetails.plotLength}>
        <FieldLabel label="Length of plot/Land" customClass="pb-2"/>
        <DynamicInput
           placeHolder='Enter length of plot/land'
           options={PLOT_UNIT_LIST}
           onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return
            if(Number(value) > 99999) return
            setDynamicFieldDetails((pre) => ({...pre, plotLength: value,plotLenghtUnit: dropdownValue}))
            setErrors((pre) => ({...pre, plotLength: ''}))
           }}
           value={dynamicFieldDetails.plotLength ?? ''}
           dropdownValue={dynamicFieldDetails?.plotLenghtUnit}
           />
          {errors?.plotLength && <p className="pt-1 text-red-500 text-xs">{errors.plotLength}</p>}
        </div>}
        {renderShowField(FIELD_NAME.PLOT_BREADTH) && <div id='plotBreadth' data-field={FIELD_NAME.PLOT_BREADTH} data-has-value={!!dynamicFieldDetails.plotBreadth}>
          <FieldLabel label="Breadth of Plot/Land" customClass="pb-2"/>
          <DynamicInput
            placeHolder='Enter breadth of plot/land'
            options={PLOT_UNIT_LIST}
            onChange={(value: string, dropdownValue: string) => {
              const isOnlyDigits = /^\d*$/.test(value);
              if(!isOnlyDigits) return
              if(Number(value) > 99999) return
              setDynamicFieldDetails((pre) => ({...pre, plotBreadth: value,plotWidthUnit: dropdownValue}))
              setErrors((pre) => ({...pre, plotBreadth: ''}))
            }}
            value={dynamicFieldDetails.plotBreadth ?? ''}
            dropdownValue={dynamicFieldDetails?.plotWidthUnit}
            />
            {errors?.plotBreadth && <p className="pt-1 text-red-500 text-xs">{errors.plotBreadth}</p>}
        </div>}
      </div>}

      {(renderShowField(FIELD_NAME.ENTRANCE_WIDTH) || renderShowField(FIELD_NAME.CELLING_HEIGHT)) && <div className="grid grid-cols-1 2md:grid-cols-2 gap-3">
        {renderShowField(FIELD_NAME.ENTRANCE_WIDTH) && <div id='entranceWidth' data-field={FIELD_NAME.ENTRANCE_WIDTH} data-has-value={!!dynamicFieldDetails.entranceWidth}>
        <FieldLabel label="Entrance Width" customClass="pb-2" required={true}/>
        <DynamicInput
           placeHolder='Enter entrance width'
           options={PLOT_UNIT_LIST}
           onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return
            if(Number(value) > 999) return
            setDynamicFieldDetails((pre) => ({...pre, entranceWidth: value,entranceWidthUnit: dropdownValue}))
            setErrors((pre) => ({...pre, entranceWidth: ''}))
           }}
           value={dynamicFieldDetails.entranceWidth ?? ''}
           dropdownValue={dynamicFieldDetails?.entranceWidthUnit}
           />
          {errors?.entranceWidth && <p className="pt-1 text-red-500 text-xs">{errors.entranceWidth}</p>}
        </div>}
        {renderShowField(FIELD_NAME.CELLING_HEIGHT) && <div id='cellingHeight' data-field={FIELD_NAME.CELLING_HEIGHT} data-has-value={!!dynamicFieldDetails.cellingHeight}>
          <FieldLabel label="Ceiling Height" customClass="pb-2" required={true}/>
          <DynamicInput
            placeHolder='Enter ceiling height'
            options={PLOT_UNIT_LIST}
              onChange={(value: string, dropdownValue: string) => {
              const isOnlyDigits = /^\d*$/.test(value);
              if(!isOnlyDigits) return
              if(Number(value) > 20) return
              setDynamicFieldDetails((pre) => ({...pre, cellingHeight: value,ceilingHeightUnit: dropdownValue}))
              setErrors((pre) => ({...pre, cellingHeight: ''}))
            }}
            value={dynamicFieldDetails.cellingHeight}
            dropdownValue={dynamicFieldDetails?.ceilingHeightUnit}
            />
            {errors?.cellingHeight && <p className="pt-1 text-red-500 text-xs">{errors.cellingHeight}</p>}
        </div>}
      </div>}
      
      {renderShowField(FIELD_NAME.WIDTH_OF_FACING_IN_FEET) && <div id='widthOfFacingRoad' data-field={FIELD_NAME.WIDTH_OF_FACING_IN_FEET} data-has-value={!!dynamicFieldDetails.widthOfFacingRoad}>
        <FieldLabel label="Width of facing road" customClass="pb-2"  required={true}/>
        <DynamicInput
           placeHolder='Enter width of facing road'
           options={PLOT_UNIT_LIST}
           onChange={(value: string, dropdownValue: string) => {
            const isOnlyDigits = /^\d*$/.test(value);
            if(!isOnlyDigits) return
            if(Number(value) > 1000 ) return
            setDynamicFieldDetails((pre) => ({...pre, widthOfFacingRoad: value,}))
            setErrors((pre) => ({...pre, widthOfFacingRoad: ''}))
           }}
           value={dynamicFieldDetails.widthOfFacingRoad ??''}
           dropdownValue={PLOT_UNIT_LIST[0].value}
           />
          {errors?.widthOfFacingRoad && <p className="pt-1 text-red-500 text-xs">{errors.widthOfFacingRoad}</p>}
      </div>}

      {renderShowField(FIELD_NAME.OPEN_SIDE) && <div id='openSide' data-field={FIELD_NAME.OPEN_SIDE} data-has-value={!!dynamicFieldDetails.openSide}>
        <FieldLabel label="No. of open sides"/>
        <div className="flex flex-wrap gap-3 pt-2">
          {
            ['1', '2', '3'].map(item => {
              return(
                <ChipTag
                  checked={item == dynamicFieldDetails.openSide}
                  label={item == '3' ? '3+' : item}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, openSide: item}))
                  }}
                  value={dynamicFieldDetails.openSide}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
          }
        </div>
      </div>}

       {renderShowField(FIELD_NAME.CONSTRUCTION_DONE) && <div id='constructinoDone' data-field={FIELD_NAME.CONSTRUCTION_DONE} data-has-value={!!dynamicFieldDetails.constructinoDone}>
        <FieldLabel label="Any Construction Done On This Property?" customClass="pb-2"/>
        <div className="flex flex-wrap gap-3">
           {
            TRUTY_LIST.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.constructinoDone}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, constructinoDone: item.value}))
                    setErrors((pre) => ({...pre, constructinoDone: ''}))
                  }}
                  value={dynamicFieldDetails.constructinoDone}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.constructinoDone && <p className="pt-1 text-red-500 text-xs">{errors.constructinoDone}</p>}
      </div>}

      {renderShowField(FIELD_NAME.TYPE_OF_CONSTRUCTION) && <div id='typeOfConstructionDone' data-field={FIELD_NAME.TYPE_OF_CONSTRUCTION} data-has-value={!!dynamicFieldDetails.constructionStatus}>
        <FieldLabel label="What Type of Construction Has Been Done?" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            CONSTRUCTION_TYPE.map((item) => {
              return(
                <ChipTag
                  checked={dynamicFieldDetails.typeOfConstructionDone.includes(item.value)}
                  label={item.name}
                  onChagne={() => {
                    let data = []
                    const isavailable = dynamicFieldDetails.typeOfConstructionDone.find(type => type == item.value)
                    if(isavailable){
                      data = dynamicFieldDetails.typeOfConstructionDone.filter(type => type != item.value)
                    }else{
                      data = [...dynamicFieldDetails.typeOfConstructionDone, item.value]
                    }
                    setDynamicFieldDetails((pre) => ({...pre, typeOfConstructionDone: data}))
                    setErrors((pre) => ({...pre, typeOfConstructionDone: ''}))
                  }}
                  value={dynamicFieldDetails.typeOfConstructionDone}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.typeOfConstructionDone && <p className="pt-1 text-red-500 text-xs">{errors.typeOfConstructionDone}</p>}
      </div>}

      {renderShowField(FIELD_NAME.CONSTRUCTION_STATUS) && <div id='constructionStatus' data-field={FIELD_NAME.PROPERTY_CONSTRUCTION_STATUS} data-has-value={!!dynamicFieldDetails.constructionStatus}>
        <FieldLabel label="Construction Status" customClass="pb-2" required={true}/>
        <div className="flex flex-wrap gap-3">
           {
            CONSTRUCTION_STATUS.map((item) => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.constructionStatus}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, constructionStatus: item.value}))
                    setErrors((pre) => ({...pre, constructionStatus: ''}))
                  }}
                  value={dynamicFieldDetails.constructionStatus}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.constructionStatus && <p className="pt-1 text-red-500 text-xs">{errors.constructionStatus}</p>}
      </div>}

      {renderShowField(FIELD_NAME.LOCATED_NEAR) && <div id='locatedNear' data-field={FIELD_NAME.LOCATED_NEAR} data-has-value={!!dynamicFieldDetails.locatedNear}>
        <FieldLabel label="Located Near" customClass="pb-2"/>
        <div className="flex flex-wrap gap-3">
           {
            LOCATED_NEAR.map((item) => {
              return(
                <ChipTag
                  checked={dynamicFieldDetails.locatedNear.includes(item.value)}
                  label={item.name}
                  onChagne={() => {
                    let data = []
                    const isavailable = dynamicFieldDetails.locatedNear.find(type => type == item.value)
                    if(isavailable){
                      data = dynamicFieldDetails.locatedNear.filter(type => type != item.value)
                    }else{
                      data = [...dynamicFieldDetails.locatedNear, item.value]
                    }
                    setDynamicFieldDetails((pre) => ({...pre, locatedNear: data}))
                    setErrors((pre) => ({...pre, locatedNear: ''}))
                  }}
                  value={item.name}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
           }
        </div>
        {errors?.locatedNear && <p className="pt-1 text-red-500 text-xs">{errors.locatedNear}</p>}
      </div>}

      {renderShowField(FIELD_NAME.OWNERSHIP) && <div id='ownership' data-field={FIELD_NAME.OWNERSHIP} data-has-value={!!dynamicFieldDetails.ownership}>
        <FieldLabel label="OwnerShip" required={true}/>
        <div className="flex flex-wrap gap-3 pt-2">
          {
            OWNERSHIP_LIST.map(item => {
              return(
                <ChipTag
                  checked={item.value == dynamicFieldDetails.ownership}
                  label={item.name}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, ownership: item.value}))
                    setErrors((pre) => ({...pre, ownership: ''}))
                  }}
                  value={dynamicFieldDetails.ownership}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[180px]"
                />
              )
            })
          }
        </div>
        {errors?.ownership && <p className="pt-1 text-red-500 text-xs">{errors.ownership}</p>}
      </div>}

      {renderShowField(FIELD_NAME.COMMERCIAL_FACING) && <div id='facing' data-field={FIELD_NAME.COMMERCIAL_FACING} data-has-value={!!dynamicFieldDetails.facing}>
        <FieldLabel label="Property Facing" />
        <div className="flex flex-wrap gap-3 pt-2">
          {
            FACING_LIST.map(item => {
              return(
                <ChipTag
                  checked={item == dynamicFieldDetails.facing}
                  label={item}
                  onChagne={() => {
                    setDynamicFieldDetails((pre) => ({...pre, facing: item}))
                  }}
                  value={dynamicFieldDetails.facing}
                  isIcon={false}
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                />
              )
            })
          }
        </div>
      </div>}

      {/* Dyname Commercial Flow Field End*/}

    </div>
      <CustomOptionField open={openCustomFieldPopup} onClose={() => handleOpenAddCustomLocation('')} label={customFieldLabel} onSubmit={handleAddCustomLocation}/>
      <div className="flex justify-end w-full">
        <div className="flex flex-wrap justify-start flex-row gap-2 items-center mt-8 sm:mt-10">
          {activeStep != 1 && <button onClick={() => {
            if(activeStep != 1){
                dispatch(setActiveStep({step: activeStep - 1}))
            }
          }} className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap font-medium`}>Back</p>
            </span>
          </button>}
          <button disabled={step1Loader} onClick={() => {
            if(activeStep != 4){
              let state = validate()
              if(state.hasError){
                scrollToError(state.errorData);
                return
              }
              let payload = generatePayload()
              handleStep1Submit(payload)
            }
          }} className="w-full md:w-[130px] text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer">
            <span className="gap-3 relative flex justify-center">
              {!step1Loader ? (
                    <p className={`text-nowrap`}>Next</p>
                  ) : (
                    <Spinner size={20} className="h-[24px]"/>
                  )}
            </span>
          </button>
        </div>
    </div>
    <ConfirmationDailog open={openConfirmationPopup} onClose={(isYes) => handleCloseConfirmationDailog(isYes)}/>
      </>}
      </>
  );
} 
