"use client";
import * as React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";

interface VideoPreviewDialogProps {
  open: boolean;
  videoUrl: string;
  onClose: () => void;
}

const VideoPreviewDialog: React.FC<VideoPreviewDialogProps> = ({
  open,
  videoUrl,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose: DialogProps["onClose"] = (_, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="video-preview-dialog"
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : "1rem",
            maxWidth: "800px",
            // width: "100%",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogContent>
        {/* Close Button */}
        <div className="flex justify-end w-full">
            <Image
            onClick={() => {
                if(onClose){
                    onClose()
                }
            }}
            src="/assets/close-icon.svg"
            alt="close"
            width={24}
            height={24}
            className="cursor-pointer"
            />
        </div>

        {/* Video Player */}
        {videoUrl ? (
          <video
            controls
            autoPlay
            className="w-auto p-3 h-auto max-h-[90vh] object-contain rounded-2xl"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-white">
            No video available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPreviewDialog;
