"use client";
import * as React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { InputBase } from "@mui/material";

export default function CustomOptionField({open, onClose, label, onSubmit, isCloseNotRequired = false} : {open: boolean,onClose: () => void, label: string, onSubmit: (value:string, label: string) => void, isCloseNotRequired?: boolean}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [fieldValue, setFieldValue] = React.useState<string>('')
  const [error, setError] = React.useState<string>('')

  const handleClose: DialogProps["onClose"] = (event, reason) => {
      if (reason === "backdropClick" || reason === "escapeKeyDown") return;
      setFieldValue('')
      onClose()
    };

    const handleSubmit = () => {
        if(!fieldValue.trim()){
            setError(`${label} is required`)
            return
        }
        if(onSubmit){
            onSubmit(fieldValue, label)
            if(!isCloseNotRequired){
              onClose()
            }
        }
    }

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

  React.useEffect(() => {
    if(open){
      setFieldValue('')
    }
  },[open])

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
                   onClose()
                }}
                src="/assets/close-icon.svg"
                alt="close"
                width={24}
                height={24}
                className="cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-[400px] p-1">
                <p className="required-label text-base text-text-black">
                  {label}
                </p>
                <div>
                <InputBase
                placeholder={`Enter ${label}`}
                fullWidth
                value={fieldValue}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                    setFieldValue(event.target.value)
                }}
                className={dynamicClass(error)}
                inputProps={{
                    className: "placeholder-gray",
                }}
                />
                {error && (
                <p className="pt-1 text-red-500 text-xs">
                    {error}
                </p>
                )}
            </div>
              <div className="pt-4 flex justify-start flex-col md:flex-row gap-4 items-center w-full">
                <button onClick={handleSubmit} className="w-full animated-button px-12 py-3 border border-blue text-center cursor-pointer">
                  <span className="gap-3 relative">
                    <p className="text-nowrap">Submit</p>
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
