"use client";
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import CustomCheckbox from "../common/checkbox";

export interface Amenities {
  name: string,
  count: number
}

export default function AmenitiesList({open, onHide, dynamicFieldDetails, handleUpdateFurnishedCount, handleAddFurnished, handleAddRemoveAmenitise, amenitiesList} : {open: boolean, onHide: () => void, setDynamicFieldDetails: (value: any) => void, dynamicFieldDetails: any, handleUpdateFurnishedCount: (name:string, value: number) => void, handleAddFurnished: (name: string) => void, handleAddRemoveAmenitise: (value: string) => void, amenitiesList: string[]}) {
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
                <p className="text-lg text-text-black font-semibold">Add property amenities</p>
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
              <p className="text-lg text-text-black font-medium pb-3">Amenities</p>
              <div className="grid grid-cols-[1fr_1fr] 2md:grid-cols-[1fr_1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr] gap-3 flex-wrap">
              {
                amenitiesList.map((item, index) => {
                  const isIncluded = dynamicFieldDetails.amenities.includes(item)
                    return (
                        <CustomCheckbox onClick={handleAddRemoveAmenitise} label={item} value={item} checked={isIncluded}/>
                    )
                })
              }
              </div>
            </div>
            <div className="flex justify-end">
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
