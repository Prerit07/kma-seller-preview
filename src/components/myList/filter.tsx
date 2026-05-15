"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import FilterChipTag from "../common/chipTag/filterChipTag";
import {
  getPropertyCategoryApiHandler,
  getPropertyListApiHandler,
  getPropertyTypeApiHandler,
  PropertyListResponse,
} from "@/services/masterService";
import {  useEffect, useRef, useState } from "react";
import { FURNISH_TYPE, LISTING_STATUS, PROPERTY_STATUS, VERIFICATION_STATUS } from "@/lib/enums";
import { InputBase, Slider } from "@mui/material";
import Image from "next/image";
import { encodeFilters } from "@/lib/helper";
import { defaultFilters } from "./contentLayout";

export default function ListFilter({ filters: stableFilter, setFilters, statusData, setSearch, search }) {
  const router = useRouter();
  const params = useSearchParams();
  const filterRef = useRef(null)
  const searchRef = useRef(null)
  const [filters,setCurrentFilters] = useState(stableFilter)
  const [tempSearch, setTempSearch] = useState('')
  const [propertyTypeList, setPropertyTypeList] = useState([])

  const updateFilter = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setCurrentFilters(newFilters)

    if(field == 'maxPrice' || field == 'minPrice'){
      clearTimeout(filterRef?.current)
      filterRef.current = setTimeout(() => {
        const encoded = encodeFilters(newFilters);
        setFilters(newFilters);
        router.replace(`?filters=${encoded}`, { scroll: false });
      }, 500);
    }else{
      setFilters(newFilters);
      const encoded = encodeFilters(newFilters);
      router.replace(`?filters=${encoded}`, { scroll: false });
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setCurrentFilters(defaultFilters)
    router.replace("/my-listing");
  };

  const { data: listingTypeList } = useQuery({
    queryKey: ["propertyList"],
    queryFn: getPropertyListApiHandler,
    select: (data: PropertyListResponse[]): { id: string; name: string }[] =>
      data.map((i) => ({ id: i.id, name: i.name })),
  });

  const { data: propertyCategoryList } = useQuery({
    queryKey: ["propertyCategory"],
    queryFn: getPropertyCategoryApiHandler,
    select: (data: PropertyListResponse[]): { id: string; name: string }[] =>
      data.map((i) => ({ id: i.id, name: i.name })),
  });

  const { mutate: getPropertyType, isPending: prpertyTypeLoader } = useMutation({
    mutationFn: () => getPropertyTypeApiHandler({ propertyListType: "", propertyCategory: "" }),
    onSuccess: () => {

    },
    onError: () => {

    }
  });

  const toggleFilterArray = (key: string, id: any) => {
    const exists = filters[key].includes(id);
    const newArr = exists
      ? filters[key].filter((x: any) => x !== id)
      : [...filters[key], id];
    updateFilter(key, newArr);
  };

  const generateActiveTags = () => {
    const tags: { key: string; id: any; label: string }[] = [];

    // Service / listingTypeIds
    listingTypeList?.forEach((item) => {
      if (filters.listingTypeIds.includes(item.id)) {
        tags.push({ key: "listingTypeIds", id: item.id, label: item.name });
      }
    });

    // Building Type / categoryIds
    propertyCategoryList?.forEach((item) => {
      if (filters.categoryIds.includes(item.id)) {
        tags.push({ key: "categoryIds", id: item.id, label: item.name });
      }
    });

    // Property Type / propertyTypeIds
    // propertyList?.forEach((item) => {
    //   if (filters.propertyTypeIds.includes(item.id)) {
    //     tags.push({ key: "propertyTypeIds", id: item.id, label: item.name });
    //   }
    // });

    // Furnishing Types
    FURNISH_TYPE.forEach((item) => {
      if (filters.furnishingTypes.includes(item.value)) {
        tags.push({ key: "furnishingTypes", id: item.value, label: item.name });
      }
    });

    LISTING_STATUS.forEach((item) => {
      if (filters.listingStatuses.includes(item.value)) {
        tags.push({ key: "listingStatuses", id: item.value, label: item.name });
      }
    });

    VERIFICATION_STATUS.forEach((item) => {
      if (filters.verificationStatuses.includes(item.value)) {
        tags.push({ key: "verificationStatuses", id: item.value, label: item.name });
      }
    });

    // Property Status
    PROPERTY_STATUS.forEach((item) => {
      if (filters.statuses.includes(item.value)) {
        tags.push({ key: "statuses", id: item.value, label: item.name });
      }
    });

    // Price Range
    if (filters.minPrice != 0 || filters.maxPrice != 10000000) {
      tags.push({
        key: "price",
        id: "price",
        label: `₹ ${filters.minPrice} - ₹ ${filters.maxPrice}`,
      });
    }

    return tags;
  };

  const removeActiveTag = (tag: { key: string; id: any }) => {
    if (tag.key === "price") {
      updateFilter("minPrice", 0);
      updateFilter("maxPrice", 10000000);
      return;
    }

    const updatedArray = filters[tag.key].filter((val: any) => val !== tag.id);
    updateFilter(tag.key, updatedArray);
  };

    const handleSearch = (value: string) => {
      setTempSearch(value)
      clearTimeout(searchRef.current)
      searchRef.current = setTimeout(() => {
        // fetchPropertyList()
        setSearch(value)
      }, 500);
    }

  useEffect(() => {
    if(JSON.stringify(stableFilter) != JSON.stringify(filters))
      setCurrentFilters(stableFilter)
  }, [stableFilter])

  useEffect(() => {
    if(Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0 && Array.isArray(filters.listingTypeIds) && filters.listingTypeIds.length > 0){
    
    }
  },[])

  const statusCount = statusData?.byStatus ?? {}
  return (
    <div className="flex flex-col bg-list-background rounded-xl px-4 py-5 justify-start gap-5 w-full">
      {/* HEADER */}
      <div className="flex justify-between w-full">
        <p className="text-lg font-medium text-text-black">Filters</p>
        <p
          className="text-base text-blue underline cursor-pointer"
          onClick={resetFilters}
        >
          Reset
        </p>
      </div>

      {generateActiveTags().length > 0 && (
        <div className="flex flex-wrap gap-1">
          {generateActiveTags().map((item) => {
            return (
              <button
                className={`h-[35px] flex items-center py-[5px] px-[10px] cursor-pointer border border-border rounded-[5px] bg-light-purple`}
                onClick={() => removeActiveTag(item)}
              >
                <span
                  className={`text-[14px] leading-[24px] text-text-gray mr-1`}
                >
                  {item.label}
                </span>
                <Image
                  alt={""}
                  src={"/assets/close-icon.svg"}
                  width={20}
                  height={20}
                />
              </button>
            );
          })}
        </div>
      )}

      <hr className="border-[#01004812]"></hr>

      <div>
        <div className="relative max-w-sm w-full 2md:w-auto">
          <InputBase
            placeholder="Search by ID..."
            type="text"
            value={tempSearch}
            onChange={(e) => {
                handleSearch(e.target.value)
            }}
            className="box-border bg-white h-[40px] w-full pl-4 pr-10 py-2 text-sm rounded-full border border-border"
            inputProps={{ className: "placeholder-gray" }}
          />
          <img
            src="/assets/search.svg"
            alt="search"
            className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer opacity-70"
          />
        </div>
      </div>

      {/* SERVICE */}
      {Array.isArray(listingTypeList) && (
        <div className="text-text-gray">
          <p className="font-medium text-base text-text-black">Service</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {listingTypeList.map((item) => {
              let checked = filters.listingTypeIds.includes(item.id);
              return (
                <FilterChipTag
                  key={item.id}
                  label={item.name}
                  isIcon={true}
                  iconSrc={
                    checked
                      ? "/assets/check-arrow-white.svg"
                      : "/assets/check-arrow-transparent.svg"
                  }
                  checked={checked}
                  onChagne={() => toggleFilterArray("listingTypeIds", item.id)}
                  value={item.name}
                  iconStyle="w-[16px] h-[16px]"
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* BUILDING TYPE */}
      {Array.isArray(propertyCategoryList) && (
        <div className="text-text-gray">
          <p className="font-medium text-base text-text-black">Building Type</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {propertyCategoryList.map((item) => {
              const checked = filters.categoryIds.includes(item.id);
              return (
                <FilterChipTag
                  key={item.id}
                  label={item.name}
                  isIcon={true}
                  iconSrc={
                    checked
                      ? "/assets/check-arrow-white.svg"
                      : "/assets/check-arrow-transparent.svg"
                  }
                  checked={checked}
                  onChagne={() => toggleFilterArray("categoryIds", item.id)}
                  value={item.name}
                  iconStyle="w-[16px] h-[16px]"
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* PROPERTY TYPE */}
      {/* {Array.isArray(propertyList) && (
        <div className="text-text-gray">
          <p className="font-medium text-base text-text-black">Property Type</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {propertyList.map((item) => {
              const checked = filters.propertyTypeIds.includes(item.id);
              return (
                <FilterChipTag
                  key={item.id}
                  label={item.name}
                  isIcon={true}
                  iconSrc={
                    checked
                      ? "/assets/check-arrow-white.svg"
                      : "/assets/check-arrow-transparent.svg"
                  }
                  checked={checked}
                  onChagne={() => toggleFilterArray("propertyTypeIds", item.id)}
                  value={item.name}
                  iconStyle="w-[16px] h-[16px]"
                  containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
                />
              );
            })}
          </div>
        </div>
      )} */}

      {/* FURNISHING TYPE */}
      <div className="text-text-gray">
        <p className="font-medium text-base text-text-black">Furnishing Type</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {FURNISH_TYPE.map((item) => {
            const checked = filters.furnishingTypes.includes(item.value);
            return (
              <FilterChipTag
                key={item.value}
                label={item.name}
                isIcon={true}
                iconSrc={
                  checked
                    ? "/assets/check-arrow-white.svg"
                    : "/assets/check-arrow-transparent.svg"
                }
                checked={checked}
                onChagne={() =>
                  toggleFilterArray("furnishingTypes", item.value)
                }
                value={item.name}
                iconStyle="w-[16px] h-[16px]"
                containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
              />
            );
          })}
        </div>
      </div>

      {/* PROPERTY STATUS */}
      {PROPERTY_STATUS.some(item => statusCount[item.value]) && <div className="text-text-gray">
        {PROPERTY_STATUS.some(item => statusCount[item.value]) && <p className="font-medium text-base text-text-black">Property Status</p>}
        <div className="flex flex-wrap gap-1 mt-1">
          {PROPERTY_STATUS.map((item) => {
            const checked = filters.statuses.includes(item.value);
            if(!statusCount[item.value]){
                return ''
            }
            return (
              <FilterChipTag
                key={item.name}
                label={item.name + (statusCount[item.value] ? ' (' + statusCount[item.value] + ')' : '')}
                isIcon={true}
                iconSrc={
                  checked
                    ? "/assets/check-arrow-white.svg"
                    : "/assets/check-arrow-transparent.svg"
                }
                checked={checked}
                onChagne={() => toggleFilterArray("statuses", item.value)}
                value={item.name}
                iconStyle="w-[16px] h-[16px]"
                containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
              />
            );
          })}
        </div>
      </div>}

      {/* Listing Status */}
      <div className="text-text-gray">
        <p className="font-medium text-base text-text-black">Listing Status</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {LISTING_STATUS.map((item) => {
            const checked = filters.listingStatuses.includes(item.value);
            return (
              <FilterChipTag
                key={item.value}
                label={item.name}
                isIcon={true}
                iconSrc={
                  checked
                    ? "/assets/check-arrow-white.svg"
                    : "/assets/check-arrow-transparent.svg"
                }
                checked={checked}
                onChagne={() =>
                  toggleFilterArray("listingStatuses", item.value)
                }
                value={item.name}
                iconStyle="w-[16px] h-[16px]"
                containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
              />
            );
          })}
        </div>
      </div>

      {/* Verification Status */}
      <div className="text-text-gray">
        <p className="font-medium text-base text-text-black">Verification Status</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {VERIFICATION_STATUS.map((item) => {
            const checked = filters.verificationStatuses.includes(item.value);
            return (
              <FilterChipTag
                key={item.value}
                label={item.name}
                isIcon={true}
                iconSrc={
                  checked
                    ? "/assets/check-arrow-white.svg"
                    : "/assets/check-arrow-transparent.svg"
                }
                checked={checked}
                onChagne={() =>
                  toggleFilterArray("verificationStatuses", item.value)
                }
                value={item.name}
                iconStyle="w-[16px] h-[16px]"
                containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
              />
            );
          })}
        </div>
      </div>

      {/* PRICE */}
      <div className="text-text-gray">
        <p className="font-medium text-base text-text-black">Price</p>

        <Slider
          sx={{
            color: "var(--color-blue)",
            "& .MuiSlider-thumb": { backgroundColor: "var(--color-blue)" },
          }}
          value={[filters.minPrice, filters.maxPrice]}
          onChange={(e, val, activeThumb) => {
            const [min, max] = val as number[];
            if (activeThumb == 0) {
              updateFilter("minPrice", min);
            } else {
              updateFilter("maxPrice", max);
            }
          }}
          valueLabelDisplay="auto"
          min={0}
          max={10000000}
        />

        <div className="flex justify-between gap-3 mt-3">
          <div>
            <p className="text-base text-text-black">From</p>
            <InputBase
              type="number"
              value={filters.minPrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value < 0) return;
                updateFilter("minPrice", Number(value))}}
              className="box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border"
            />
          </div>
          <div>
            <p className="text-base text-text-black">To</p>
            <InputBase
              type="number"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
              className="box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
