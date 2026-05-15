'use client';

import * as React from "react";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

export default function VerifyPropertyLink({open, onClose, link}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Dialog Close Handler
  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose()
  };


  const handleCopyLink = async () => {
    try {
    await navigator.clipboard.writeText(link);
    alert("Link copied to clipboard");
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = link;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    document.execCommand("copy");
    document.body.removeChild(textarea);

    alert("Link copied to clipboard");
  }
  }
  
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
      slotProps={{
        paper: {
          sx: { borderRadius: fullScreen ? '' : "1rem", },
        },
      }}
    >
      <DialogContent>
        <div className="flex flex-col w-full sm:w-fit p-2">
          <div className="flex justify-between w-full pb-2">
            <p className="text-lg font-medium text-text-black">Verify Property</p>
            <Image
              onClick={() => {
                onClose()
              }}
              src="/assets/close-icon.svg"
              alt="close"
              width={24}
              height={24}
              className="cursor-pointer"
            />
          </div>
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-1 flex-col items-center gap-2 py-3">
                    <Image src={'/assets/copy-link.svg'} height={64} width={49} alt="visit the property" />
                    <p className="text-text-black text-center text-sm">Copy and Open Below Link on phone</p>
                </div>
                <div>
                    <Image src={'/assets/blue-arrow-left.svg'} height={25} width={25} alt="visit the property" />
                </div>
                <div className="flex flex-1 flex-col items-center gap-2 py-3">
                    <Image src={'/assets/visit-property.svg'} height={64} width={73} alt="visit the property" />
                    <p className="text-text-black text-center text-sm">Visit the property</p>
                </div>
                <div>
                    <Image src={'/assets/blue-arrow-left.svg'} height={25} width={25} alt="visit the property" />
                </div>
                <div className="flex flex-1 flex-col items-center gap-2 py-3">
                    <Image src={'/assets/submit-photo.svg'} height={64} width={64} alt="visit the property" />
                    <p className="text-text-black text-center text-sm">Click photos & submit</p>
                </div>
            </div>
            <div className="grid grid-cols-[1fr_34px] gap-2 mt-5">
                <div title={link} className="select-none flex-1 min-w-0 border border-border rounded-[5px] py-2 px-3 truncate">
                   {link}
                </div>
                <div onClick={handleCopyLink} title="Click here to Copy Link" className="flex items-center justify-center border border-border rounded-[5px] py-1 px-1 cursor-pointer hover:bg-list-background">
                    <Image src={'/assets/copy.svg'} width={20} height={20} alt="copy link" />
                </div>
            </div>
            <div className="mt-1">
              <p className="text-xs text-text-gray">Note*: Above Link valid only for 24 hours.</p>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
