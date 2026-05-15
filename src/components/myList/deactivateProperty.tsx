import * as React from "react";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Dialog, InputBase } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  deActivatePropertyApiHandler,
  DeactivatePropertyResponse,
} from "@/services/postProperty";
import { toast } from "react-toastify";

export default function DeactivateProperty({ open, onClose, propertyId }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [fieldValue, setFieldValue] = React.useState("");
  const [error, setError] = React.useState("");

  const handleClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setFieldValue("");
    onClose(false);
  };

  const { mutate: handleDeactive, isPending: loader } = useMutation({
    mutationFn: deActivatePropertyApiHandler,
    onSuccess: (response: DeactivatePropertyResponse) => {
        onClose(true)
    },
    onError: (error) => {
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleSubmit = () => {
    if (!fieldValue && !fieldValue.trim()) {
      setError("Deactivate reason is required");
      return;
    }
    const paylaod = {
      propertyId: propertyId,
      deactivationReason: fieldValue,
    };
    handleDeactive(paylaod);
  };

  React.useEffect(() => {
    if (open) {
      setFieldValue("");
    }
  }, [open]);

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
              borderRadius: fullScreen ? "" : "1rem",
            },
          },
        }}
      >
        <DialogContent>
          <div>
            <div className="flex justify-end w-full">
              <img
                onClick={() => {
                  onClose(false);
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
                {"Deactivate Property"}
              </p>
              <div>
                <InputBase
                  placeholder={"Enter reason"}
                  multiline
                  fullWidth
                  minRows={4}
                  value={fieldValue}
                  onChange={(event) => {
                    setFieldValue(event.target.value);
                    setError("");
                  }}
                  className="box-border text-sm text-text-gray rounded-xl border border-border focus:outline-none focus:border-blue"
                  sx={{
                    "& .MuiInputBase-input": {
                      padding: "1rem",
                    },
                  }}
                />
                {error && <p className="pt-1 text-red-500 text-xs">{error}</p>}
              </div>
              <div className="pt-4 flex justify-start flex-col md:flex-row gap-4 items-center w-full">
                <button
                  onClick={handleSubmit}
                  disabled={loader}
                  className="w-full animated-button px-12 py-3 border border-blue text-center cursor-pointer"
                >
                  <span className="gap-3 relative">
                    <p className="text-nowrap">{"Deactivate"}</p>
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
