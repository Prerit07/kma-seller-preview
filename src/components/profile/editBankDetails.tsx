"use client";
import * as React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import BankDetails from "../kyc/bankDetails";


export default function BankDetailsUpdate({ open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));


  const dynamicClass = (flag: string) => {
    return `
      box-border h-[47.81px] px-4 py-2 text-sm rounded-full 
      border focus:outline-none
      ${
        Boolean(flag)
          ? "border-red-500 focus:border-red-500"
          : "border-border focus:border-blue"
      }
      text-text-gray
    `;
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={() => onClose(false)}
        aria-labelledby="responsive-dialog-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: fullScreen ? "" : "1rem",
            },
          },
        }}
      >
        <DialogContent>
          <div className="w-full md:w-[552px]">
            <p className="text-lg text-text-black font-medium mb-2">Edit Bank Details</p>
            <BankDetails isPopup={true} onClose={onClose}/>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
