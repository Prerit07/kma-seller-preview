"use client";

import { Radio } from "@mui/material";
import Image from "next/image";
import DynamicSelect from "../select";
import React from "react";
import { MultiValue } from "react-select";

export type OptionType = {
  label: string;
  value: string;
};

export interface PhotoData {
  url: string,
  isCoverImage?: boolean,
  fileKey: string,
  view?: OptionType | MultiValue<OptionType> | null
}
export interface PhotoViewerProps {
  type: "photo" | "video";
  options?: OptionType[];
  onCoverChange?: (checked: boolean, id: string) => void;
  onRoomChange?: (value: OptionType | MultiValue<OptionType> | null, id: string) => void;
  onDelete?: (id: string) => void;
  previewVideo?: (url: string) => void;
  id: string,
  data: PhotoData
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  type,
  data,
  options = [],
  onCoverChange,
  onRoomChange,
  onDelete,
  previewVideo,
  id
}) => {
  return (
    <div className="relative w-full rounded-[10px]">
      {/* Main Image / Video Thumbnail */}
      {
        type == 'photo' && (
          <img
            alt="photo"
            src={data.url ?? ''}
            className="rounded-[10px] w-full aspect-video object-cover"
          />
        )
      }
      {type == 'video' && <video
        src={data.url ?? ''}
        className="rounded-[10px] w-full aspect-video"
      />}

      {/* PHOTO TYPE */}
      {type === "photo" && (
        <div className="absolute top-0 p-2 w-full flex h-full flex-col justify-between">
          {/* Top Row - Cover + Delete */}
          <div className="flex justify-between">
            <div
              className={`
                w-[80px] h-[31px] bg-white flex items-center px-1 rounded-full cursor-pointer transition-all
              `}
              onClick={() => {
                    if(onCoverChange){
                        onCoverChange(!data.isCoverImage, id)
                    }
                }}
            >
              <Radio
                name="userType"
                checked={data.isCoverImage}
                disableRipple
                disableFocusRipple
                disableTouchRipple
                sx={{
                  padding: {
                    xs: "2px",
                    sm: "3px 2px 3px 3px",
                    md: "4px 4px 4px 4px",
                  },
                  color: "var(--color-text-black)",
                  "& .MuiSvgIcon-root": {
                    fontSize: 20,
                  },
                  "&.Mui-checked": {
                    color: "var(--color-text-black)",
                    '& [data-testid="RadioButtonCheckedIcon"]': {
                      transform: "scale(1.3)",
                    },
                  },
                }}
              />
              <span className="text-sm text-text-black">Cover</span>
            </div>

            <div
              className="bg-white cursor-pointer rounded-full w-[31px] h-[31px] flex justify-center items-center cursor-pointer"
              onClick={() => {
                if(onDelete){
                    onDelete(id)
                }
              }}
            >
              <Image alt="delete" src="/assets/delete.svg" width={16} height={16} />
            </div>
          </div>

          {/* Bottom Row - Room Select */}
          <div className="flex justify-end">
            <div className="w-[150px]">
              <DynamicSelect
                placeholder="Select view"
                minHeight="30px"
                options={options}
                value={data.view}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                onChange={(val) => {
                    if(onRoomChange){
                        onRoomChange(val, id)
                    }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIDEO TYPE */}
      {type === "video" && (
        <>
          <div className="absolute top-0 p-2 w-full flex h-full justify-end">
            <div
              className="bg-white cursor-pointer rounded-full w-[31px] h-[31px] flex justify-center items-center cursor-pointer"
              onClick={() => {
                if(onDelete){
                    onDelete(id)
                }
              }}
            >
              <Image alt="delete" src="/assets/delete.svg" width={16} height={16} />
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex cursor-pointer items-center justify-center rounded-full w-12 h-12 bg-[#01004866]">
              <div onClick={() => {
                if(previewVideo){
                  previewVideo(data.url)
                }
              }} className="flex items-center justify-center rounded-full w-10 h-10 bg-blue">
                <Image alt="play" src="/assets/play-white.svg" width={16} height={16} />
              </div>
            </div>
          </div>
        </>
      )}
      
    </div>
  );
};

export default PhotoViewer;
