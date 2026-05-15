"use client";
import * as React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";


export default function ConfirmationDailog({open, onClose}: {open: boolean, onClose: (isYes: boolean) => void}) {
 const theme = useTheme();
 const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
     onClose(false)
  };

  const handleContinue = () => {
    onClose(true)
  }

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: fullScreen ? '' : "1rem",
            },
          },
        }}
      >
        <DialogContent>
          <div >
            <div className="flex justify-end w-full">
              <Image
                onClick={() => {
                   onClose(false)
                }}
                src="/assets/close-icon.svg"
                alt="close"
                width={24}
                height={24}
                className="cursor-pointer"
              />
            </div>
            <div className="flex flex-col items-center gap-4 xl:gap-6 w-full md:w-[400px] p-1">
              
              <div className="content-start w-full">
               
                <p className="text-base text-text-gray">
                  Are you sure you want to change this? It will clear all the step data.
                </p>
              </div>
              
              <div className="flex justify-between flex-col md:flex-row gap-4 items-center">
                <button onClick={() => onClose(false)} className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
                  <span className="gap-3 relative">
                    <p className="text-nowrap">No</p>
                  </span>
                </button>
                <button onClick={handleContinue} className="w-full md:w-auto animated-button px-12 py-3 border border-blue text-center cursor-pointer">
                  <span className="gap-3 relative">
                    <p className="text-nowrap">Yes</p>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
