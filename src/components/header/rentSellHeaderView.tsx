import { getAboutusData, getPropertyMasterData, getSelectedCity } from "@/store/homeHeaderSlice";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "nextjs-toploader/app";
import { useEndUserProperties } from "@/api/hooks/useEndUserProperties";

export default function RentSellHeaderView({ type, onClose }: { type: string; onClose?: () => void }) {
  const router = useRouter();
  const selectedCity = useSelector(getSelectedCity);
  const aboutusData = useSelector(getAboutusData) as {
    phoneNumber?: string;
    email?: string;
    mobileAppAvailable?: boolean;
  } | null;
  const propertyMasterData = useSelector(getPropertyMasterData) as Array<{
    code: string;
    id?: string;
    categories?: Array<{
      id: string;
      code: string;
      name: string;
      propertyTypes: Array<{ id: string; name: string }>;
    }>;
  }> | null;
  const contactNumber = aboutusData?.phoneNumber ?? "";
  const tollFreeDisplay = contactNumber
    ? contactNumber.startsWith("+")
      ? contactNumber
      : `+91 ${contactNumber}`
    : "";
  const category = (Array.isArray(propertyMasterData) ? propertyMasterData : [])?.find((item: { code: string }) => item.code == type)?.categories ?? [];
  const defaultCategoryId = category.find((item: { code: string }) => item.code == 'residential')?.id ?? category[0]?.id;
  const [categoryType, setCategoryType] = useState(defaultCategoryId);
  const propertyList = category?.find(item => item.id == categoryType)?.propertyTypes ?? []

  // Fetch properties for this city + listing type to know which property types have results
  const listingTypeId = (Array.isArray(propertyMasterData) ? propertyMasterData : [])?.find((item: { code: string }) => item.code == type)?.id;
  const { data: properties = [], isLoading, isFetching } = useEndUserProperties(
    {
      cityId: selectedCity?.id,
      listingTypeIds: listingTypeId ? [listingTypeId] : undefined,
      categoryIds: categoryType ? [categoryType] : undefined,
      limit: 100,
      page: 1,
    },
    { enabled: !!selectedCity?.id && !!listingTypeId }
  );

  // Extract property type IDs that have at least 1 property
  const availablePropertyTypeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of properties) {
      const ptId = typeof p.propertyType === 'object' && p.propertyType?.id
        ? p.propertyType.id
        : p.propertyTypeId;
      if (ptId) ids.add(ptId);
    }
    return ids;
  }, [properties]);

  // Filter property types to only show ones with properties
  const visiblePropertyList = useMemo(() => {
    if (!selectedCity?.id || availablePropertyTypeIds.size === 0) return propertyList;
    return propertyList.filter(item => availablePropertyTypeIds.has(item.id));
  }, [propertyList, availablePropertyTypeIds, selectedCity?.id]);

  return (
    <div className="flex  flex-col 2md:flex-row justify-start overflow-hidden rounded-xl h-full 2md:h-[280px]">
      <div className="flex flex-col gap-6 2md:gap-0 justify-between bg-blue pl-8 pt-8 pb-3 pr-5">
        <div className="flex flex-col gap-2">
          {
            category.map(item => {
              return(
                <p key={item.id} onClick={() => setCategoryType(item.id)} className="text-white text-base cursor-pointer w-fit" style={{borderBottom: categoryType == item.id ? '1px solid white' : ''}}>{item.name}</p>
              )
            })
          }

        </div>
        <div>
          <p className="text-white text-xs">Contact Us Toll Free on</p>
          <p className="text-white text-xs">
            <span className="font-semibold text-xs">{tollFreeDisplay}</span> ( 9AM - 11PM IST )
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 2md:grid-cols-[1fr_150px] bg-white pl-8 py-5 pr-5">
        <div className="flex justify-between flex-col gap-3 2md:gap-0 pr-5">
          <p className="text-base 2md:mb-2 text-text-gray break-inside-avoid underline font-medium">
            Property Type
          </p>
            <div className="2md:columns-2 2md:h-[180px] [column-fill:auto]">
              {
                (isLoading || isFetching) ? (
                  <p className="text-sm text-text-gray">Loading properties...</p>
                ) : visiblePropertyList.length > 0 ? visiblePropertyList.map(item => {
                  return(
                    <p
                      key={item.id}
                      onClick={() => {
                        onClose?.();
                        const basePath = selectedCity?.id ? `/projects/${selectedCity.id}` : "/projects";
                        const params = new URLSearchParams();
                        params.set('propertyTypeId', item.id);
                        if (listingTypeId) params.set('listingTypeId', listingTypeId);
                        router.push(`${basePath}?${params.toString()}`);
                      }}
                      className="cursor-pointer text-sm mt-1  text-text-black break-inside-avoid hover:underline"
                    >
                      {item.name} {selectedCity ? `in ${selectedCity?.name}` : ''}
                    </p>
                  )
                }) : (
                  <p className="text-sm text-text-gray">No properties available</p>
                )
              }

            </div>
            <div>
                <p className="text-xs text-text-gray max-w-[250px] lg:max-w-fit">
                  Email Us at {aboutusData?.email || "Services@kma.com"} or call us at {tollFreeDisplay || "N/A"} (IND Toll-Free)
                </p>
            </div>
        </div>
        {aboutusData?.mobileAppAvailable && <div className="mt-5 2md:mt-0">
          <Image
            src={"/assets/app-banner.svg"}
            width={300}
            height={300}
            alt="app"
            className="w-[95%] 2md:w-[150px] h-full"
          />
        </div>}
      </div>
    </div>
  );
}
