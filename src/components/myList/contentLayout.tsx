'use client'
import { useEffect, useState } from "react";
import ListFilter from "./filter";
import Listing from "./listing";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeFilters } from "@/lib/helper";
import { ProeprtyListApiPayload, propertyListApiPayload, PropertyListApiResponse } from "@/services/postProperty";
import { useQuery } from "@tanstack/react-query";

export const defaultFilters = {
      propertyTypeIds: [],
      categoryIds: [],
      listingTypeIds: [],
      furnishingTypes: [],
      projectStatuses: [],
      listingStatuses: [],
      verificationStatuses: [],
      filter: '',
      statuses: [],
      minPrice: 0,
      maxPrice: 10000000,
      search: ''
  };

  
export default function ContentLayout() {
  const params = useSearchParams();

  const [listLoader, setListLoader] = useState(true)
  const [enable, setEnable] = useState(false)
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
    total: 0
  })
  const [sorting, setSorting] = useState({
    order: 'High to Low',
    fieldName: 'createdAt'
  })
  const [search, setSearch] = useState('')
  const [topStatusFilter, setTopStatusFilter] = useState('')

 
  const { data: propertyList,  refetch: fetchPropertyList, isLoading: propertyListLoader } = useQuery({
      queryKey: ["property-list", filters, sorting, search, pagination.page, pagination.limit, topStatusFilter],
      queryFn: () => {
        let payload: ProeprtyListApiPayload = {
          page: pagination.page,
          limit: pagination.limit,
          ...(filters.categoryIds.length > 0 ? {categoryIds: filters.categoryIds.join(',')} : {}),
          ...(filters.propertyTypeIds.length > 0 ? {propertyTypeIds: filters.propertyTypeIds.join(','),} : {}),
          ...(filters.listingTypeIds.length > 0 ? {listingTypeIds: filters.listingTypeIds.join(','),} : {}),
          ...(filters.furnishingTypes.length > 0 ? {furnishingTypes: filters.furnishingTypes.join(','),} : {}),
          ...(filters.listingStatuses.length > 0 ? {listingStatuses: filters.listingStatuses.join(','),} : {}),
          ...(filters.verificationStatuses.length > 0 ? {verificationStatuses: filters.verificationStatuses.join(','),} : {}),
          ...(filters.projectStatuses.length > 0 ? {projectStatuses: filters.projectStatuses.join(','),} : {}),
          ...(filters.statuses.length > 0 ? {statuses: filters.statuses.join(','),} : {}),
          ...(topStatusFilter ? {filter: topStatusFilter} : null),
          ...(filters.minPrice > 0 ? {minPrice: String(filters.minPrice)} : {}),
          ...(filters.maxPrice < 10000000 ? {maxPrice: String(filters.maxPrice)} : {}),
          search: search,
          sortOrder: sorting.order == 'High to Low'? 'DESC' : 'ASC',
          sortBy: sorting.fieldName,
        }
        return propertyListApiPayload(payload)
      },
      select: (data: PropertyListApiResponse) =>{
        return data
      },
      enabled: enable,
      staleTime: 0,
      refetchOnMount: true,   
      retry: false
    });

  useEffect(() => {
      const query = params.get("filters");
      if (query) {
          const parsed = decodeFilters(query);
          if (parsed) setFilters(parsed);
      }
      setEnable(true)
  }, []);

  // Reset to page 1 when filters, sorting, search, or top status filter change
  useEffect(() => {
    setPagination((pre) => ({ ...pre, page: 1 }));
  }, [filters, sorting, search, topStatusFilter]);
  
  useEffect(() => {
    if(propertyList){
      const paginationData = propertyList?.pagination
      if(paginationData){
        setPagination((pre) => ({...pre, limit: paginationData.limit, page: paginationData.page, totalPage: paginationData.totalPages}))
      }
      setListLoader(false)
    }
  },[propertyList])

  return (
    <>
      <div
        className="bg-white relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl"
        style={{ boxShadow: "0px 4px 20px 0px #0000000D", flexGrow: 11 }}
      >
        <div className="pt-4 p-5">
          
         <div className="flex flex-col gap-6 md:gap-6 w-full">
            <div className="grid grid-cols-1 2md:grid-cols-[1.3fr_3fr] gap-4">
                <ListFilter statusData={propertyList?.summary ?? {}} filters={filters} setFilters={setFilters} setSearch={setSearch} search={search}/>
                <Listing propertyList={propertyList?.items ?? []} propertyListLoader={propertyListLoader} listLoader={listLoader} fetchPropertyList={fetchPropertyList} setTopStatusFilter={setTopStatusFilter} topStatusFilter={topStatusFilter}  setSorting={setSorting} sorting={sorting} setPagination={setPagination} pagination={pagination}/>
            </div>
         </div>
        </div>
      </div>
    </>
  );
}
