import { Menu, MenuItem } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";
import ListCard from "./listCard";
import CustomPagination from "../common/pagination";
import FullscreenSpinner from "../common/spinner/fullScreenSpinner";
import { useRouter } from "next/navigation";
import { FILTER_STATUS } from "@/lib/enums";
import PropertyView from "./propertyProfile";

const sortField = {
    price: 'Price',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    expiresAt: 'Expiring On'
}

export default function Listing({propertyList = [],listLoader, setPagination, pagination, topStatusFilter, setTopStatusFilter, sorting, setSorting, propertyListLoader}) {
  const router = useRouter();

  const [anchorElOrder, setAnchorElOrder] = useState(null);
  const [anchorElSort, setAnchorElSort] = useState(null);
  

  const openOrder = Boolean(anchorElOrder);
  const openSort = Boolean(anchorElSort);

  const handleSorting = (order: string) => {
    setSorting((pre) => ({...pre, order: order}))
  }

  const handleSortField = (fieldName: string) => {
    setSorting((pre) => ({...pre, fieldName: fieldName}))
  }

  const handlePagination = (value:string) => {
    setPagination((pre) => ({...pre, page: value}))
  }

  const handleTopFilter = (value:string) => {
    if(topStatusFilter == value){
      setTopStatusFilter('')
    }else{
      setTopStatusFilter(value)
    }
  }

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const handleManage = (id) => {
      setSelectedPropertyId(id);
  };
  
  return (
    <div className="flex flex-col px-2 py-5 gap-3">
      <p className="text-lg font-medium text-text-black">Property Listing</p>

      <div className="flex flex-col lg:flex-row gap-3 items-start justify-end">
        <div className="flex flex-wrap flex-1 gap-2">
            {
                FILTER_STATUS.map(item => {
                  const checked = topStatusFilter == item.value
                    return(
                        <div onClick={() => handleTopFilter(item.value)} className={`cursor-pointer flex items-center rounded-[5px] py-1 ${checked ? 'border border-blue bg-light-purple text-text-black': 'border border-border text-text-gray'}`}>
                            <p className={` px-3 text-sm`}>{item?.name}</p>
                            {/* <p className="border-l h-full py-1 text-blue text-sm font-medium px-2 bg-[#0100481A]">
                            30
                            </p> */}
                        </div>
                    )
                })
            }
        </div>
      </div>
    <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start gap-2 sm:items-center mt-4">
      <div>
        {pagination?.total ? <p className="text-sm text-text-gray">Showing <span className="font-medium text-blue">{(pagination?.page * pagination?.limit) - pagination.limit + 1}-{pagination?.page * pagination?.limit} Out</span> of <span className="font-medium text-blue">{pagination?.total}</span> Properties</p> : ''}
      </div>
      <div className="flex items-center gap-5">
        
        <div
          onClick={(e) => setAnchorElOrder(e.currentTarget)}
          className="text-sm cursor-pointer flex justify-start items-center gap-2"
        >
          <button className="cursor-pointer">{sorting.order ? sorting.order : `Sort By`}</button>
          <img src={"/assets/down-arrow-outline-black.svg"}></img>
        </div>
        <Menu
          anchorEl={anchorElOrder}
          open={openOrder}
          onClose={() => setAnchorElOrder(null)}
        >
          <MenuItem
            onClick={() => {
             handleSorting('Low to High')
              setAnchorElOrder(null);
            }}
          >
            Low to High
          </MenuItem>
          <MenuItem
            onClick={() => {
                handleSorting('High to Low')
              setAnchorElOrder(null);
            }}
          >
            High to Low
          </MenuItem>
        </Menu>

        <div onClick={(e) => setAnchorElSort(e.currentTarget)} className="text-sm cursor-pointer flex items-center gap-2 cursor-pointer">
          <button className="cursor-pointer">
            {sorting?.fieldName ? sortField[sorting?.fieldName] : "Select filter"}
          </button>
          <img src="/assets/fitler-line.svg" className="w-5 h-5"></img>
        </div>
        <Menu
          anchorEl={anchorElSort}
          open={openSort}
          onClose={() => setAnchorElSort(null)}
        >
          <MenuItem
            onClick={() => {
            handleSortField('price')
              setAnchorElSort(null);
            }}
          >
            Price
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSortField('createdAt')
              setAnchorElSort(null);
            }}
          >
            Created At
          </MenuItem>
          <MenuItem
            onClick={() => {
             handleSortField('updatedAt')
              setAnchorElSort(null);
            }}
          >
            Updated At
          </MenuItem>
          <MenuItem
            onClick={() => {
             handleSortField('expiresAt')
              setAnchorElSort(null);
            }}
          >
            Expiring On
          </MenuItem>
        </Menu>
      </div>
    </div>
            <div>
              {(propertyListLoader || listLoader) && <FullscreenSpinner/>}
            </div>
            <div className="flex gap-3 flex-col">
                {Array.isArray(propertyList) && propertyList.map(item => {

                    return (
                        <ListCard data={item} handleManage={(id) => handleManage(id)}/>
                    )
                })}
            </div>
           {!listLoader && Array.isArray(propertyList) && propertyList.length == 0 && <div className="flex justify-center flex-col items-center">
               <p className="text-sm font-medium text-gray-700">
                  No properties found
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Try changing filters or search criteria
                </p>
            </div>}

            {Array.isArray(propertyList) &&  propertyList.length != 0 && <div>
                <CustomPagination page={pagination.page} totalPages={pagination.totalPage} onChange={(value) => handlePagination(value)}/>
            </div>}

            {selectedPropertyId && (
              <PropertyView
                open={!!selectedPropertyId}
                onClose={() => setSelectedPropertyId(null)}
                propertyId={selectedPropertyId}
              />
            )}
    </div>
  );
}
