"use client";
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { usePathname, } from "next/navigation";
import { useRouter } from "next/navigation";
import AmenitiesCard from "../common/amenities";

export interface Amenities {
  name: string,
  count: number
}

export default function Furnishing({open, onHide, dynamicFieldDetails, handleUpdateFurnishedCount, handleAddFurnished, furnishingList, setDynamicFieldDetails} : {open: boolean, onHide: () => void, setDynamicFieldDetails: (value: any) => void, dynamicFieldDetails: any, handleUpdateFurnishedCount: (name:string, value: number) => void, handleAddFurnished: (name: string) => void, handleAddRemoveAmenitise: (value: string) => void, furnishingList: {label: string , icon: string}[]}) {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={() => onHide()}
        aria-labelledby="responsive-dialog-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: fullScreen ? '' : "1rem",
            },
            
          },
        }}
        maxWidth='xl'
        
      >
        <DialogContent>
          <div >
            <div className="flex justify-between w-full">
                <p className="text-lg text-text-black font-semibold">Add property furnishings</p>
              <Image
                onClick={() => {
                   onHide()
                }}
                src="/assets/close-icon.svg"
                alt="close"
                width={24}
                height={24}
                className="cursor-pointer"
              />
            </div>
            <div className="pt-4">
              <p className="text-lg text-text-black font-medium pb-3">Select Furnishings</p>
              <div className="grid grid-cols-[1fr] 2md:grid-cols-[1fr_1fr_1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr] gap-3 flex-wrap"> 
                  {
                      furnishingList.map((item, index) => {
                        let furnisher = dynamicFieldDetails.furnishingsCounts.find(furnish => furnish.name == item.label)
                          
                        return(
                            <AmenitiesCard key={index} checked={furnisher ? true : false} icon={item.icon} label={item.label} count={furnisher?.count ?? 0} handleAddFurnished={handleAddFurnished} handleUpdateFurnishedCount={handleUpdateFurnishedCount}/>
                          )
                      })
                  }
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => {
                setDynamicFieldDetails((pre) => ({...pre, furnishingsCounts: []}))
              }} className="mt-4 w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
                <span className="gap-3 relative flex justify-center">
                  <p className={`text-nowrap font-medium`}>Reset All</p>
                </span>
              </button>
            <button
              onClick={onHide}
                className="mt-4 w-full md:w-[150px] text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
              >
                <span className="gap-3 relative flex justify-center">
                  <p className={`text-nowrap`}>Save</p>
                </span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
