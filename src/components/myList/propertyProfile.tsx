"use client";
import * as React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { LinearProgress, linearProgressClasses } from "@mui/material";
import styled from "@emotion/styled";
import { getPropertyDetailsApiHandler, GetPropertyDetailsResponse, getVerifyPropertyLinkAPiHandler, GetVerifyPropertyLinkResponse, repostPropertyApiHandler, RepostPropertyResponse } from "@/services/postProperty";
import { useMutation, useQuery } from "@tanstack/react-query";
import VideoPreviewDialog from "../common/videoPreview";
import { getStatusLabel } from "@/lib/helper";
import { useDispatch } from "react-redux";
import { setActiveStep } from "@/store/postPropertyProgress";
import { useRouter } from "nextjs-toploader/app";
import { propertyStatusColor } from "@/lib/enums";
import DeactivateProperty from "./deactivateProperty";
import { toast } from "react-toastify";
import moment from "moment";
import VerifyPropertyLink from "../verify-property-info";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#A6A6A67D",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
}));

const PropertyView = ({ open, onClose, propertyId }) => {
  const imageBaseUrl = process.env.NEXT_PUBLIC_AWS_URL
  const dispatch = useDispatch()
  const theme = useTheme();
  const router = useRouter()
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openVideoPreview, setOpenVideoPreview] = React.useState(false)
  const [videoPreviewUrl, setVideoPreviewUrl] = React.useState(null)
  const [openDeactivePopup, setOpenDeactivePopup] = React.useState(false)
  const [oepnverifyPopup, setOpenVerifyPopup] = React.useState(false)
  const [verifyLink, setVerifyLink] = React.useState(null)

  const handleClose: DialogProps["onClose"] = (_, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose(false);
  };

  const { data: propertyDetails } = useQuery({
      queryKey: ["property-list", propertyId],
      queryFn: () => {
        return getPropertyDetailsApiHandler(propertyId)
      },
      select: (data: GetPropertyDetailsResponse & {
        property?: GetPropertyDetailsResponse;
        verificationStatus?: string | null;
        comments?: string | null;
      }) =>{
        if (data?.property) {
          return {
            ...data.property,
            verificationStatus: data?.verificationStatus ?? data?.property?.verificationStatus ?? null,
            comments: data?.comments ?? data?.property?.comments ?? null,
          } as GetPropertyDetailsResponse;
        }
        return data
      },
      enabled: !!propertyId,
      staleTime: 0,
      refetchOnMount: true   
    });

    const { mutate: handleRepost, isPending: repostLoader } = useMutation({
    mutationFn: repostPropertyApiHandler,
    onSuccess: (response: RepostPropertyResponse) => {
      toast.success(response?.message)
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

  const { mutate: handleVerifyProperty, isPending: verifyLoader } = useMutation({
    mutationFn: getVerifyPropertyLinkAPiHandler,
    onSuccess: (response: GetVerifyPropertyLinkResponse) => {
      setVerifyLink(response?.verificationLink)
      setOpenVerifyPopup(true)
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

    const handleOpenVideoPreview = (url) => {
        setOpenVideoPreview(true)
        setVideoPreviewUrl(url)
    }

    const handleClosePreview = () => {
        setOpenVideoPreview(false)
        setVideoPreviewUrl(null)
    }

    const handleEdit = () => {
        router.push(`/post-property/${propertyDetails.id}`)
    }

    const handleUploadPhoto = () => {
      dispatch(setActiveStep({step: 4}))
      router.push(`/post-property/${propertyDetails.id}?redirectTo=true`)
    }

    const getStatusColor = (status) => {
      return propertyStatusColor.find(item => item.status == status) ?? null
    }

    const mediaPreviewItems = React.useMemo(() => {
      type MediaPreviewItem = {
        id: string;
        type: "photo" | "video";
        fileKey: string;
        src: string;
        view?: string;
        isCoverImage?: boolean;
      };

      const photoItems: MediaPreviewItem[] = Array.isArray(propertyDetails?.photos)
        ? propertyDetails.photos.map((item, index) => ({
            id: `photo-${item.fileKey}-${index}`,
            type: "photo",
            fileKey: item.fileKey,
            src: (item as { url?: string })?.url ?? (imageBaseUrl + item.fileKey),
            view: item.view,
            isCoverImage: item.isCoverImage,
          }))
        : [];

      const videoItems: MediaPreviewItem[] = Array.isArray(propertyDetails?.videos)
        ? propertyDetails.videos.filter((item) => item?.fileKey || item?.url).map((item, index) => ({
            id: `video-${item.fileKey}-${index}`,
            type: "video",
            fileKey: item.fileKey ?? `video-${index}`,
            src: item?.url ?? (imageBaseUrl + item.fileKey),
          }))
        : [];

      return [...photoItems, ...videoItems];
    }, [propertyDetails?.photos, propertyDetails?.videos, imageBaseUrl]);

    const {
      mainMediaItem,
      sideMediaItems,
      extraMediaCount,
      viewAllTileIndex,
      totalMediaCount,
    } = React.useMemo(() => {
      const photos = mediaPreviewItems.filter((item) => item.type === "photo");
      const videos = mediaPreviewItems.filter((item) => item.type === "video");
      const mainItem =
        photos.find((item) => item.isCoverImage) ?? photos[0] ?? videos[0] ?? null;

      const usedMediaIds = new Set<string>();
      if (mainItem) {
        usedMediaIds.add(mainItem.id);
      }

      const remainingPhotos = photos.filter((item) => !usedMediaIds.has(item.id));
      const remainingVideos = videos.filter((item) => !usedMediaIds.has(item.id));

      const sideItems: typeof mediaPreviewItems = [];

      if (remainingVideos.length > 0) {
        sideItems.push(...remainingPhotos.slice(0, 3));
        sideItems.push(remainingVideos[0]);

        if (sideItems.length < 4) {
          sideItems.push(
            ...remainingPhotos.slice(3, 3 + (4 - sideItems.length))
          );
        }

        if (sideItems.length < 4) {
          sideItems.push(
            ...remainingVideos.slice(1, 1 + (4 - sideItems.length))
          );
        }
      } else {
        sideItems.push(...remainingPhotos.slice(0, 4));
      }

      const normalizedSideItems = sideItems.slice(0, 4);
      normalizedSideItems.forEach((item) => usedMediaIds.add(item.id));

      const totalCount = mediaPreviewItems.length;
      const remainingCount = Math.max(totalCount - usedMediaIds.size, 0);
      const hasBottomRightVideo =
        normalizedSideItems.length === 4 &&
        normalizedSideItems[3]?.type === "video";
      const allTileIndex =
        normalizedSideItems.length === 0
          ? -1
          : hasBottomRightVideo
          ? 2
          : normalizedSideItems.length - 1;

      return {
        mainMediaItem: mainItem,
        sideMediaItems: normalizedSideItems,
        extraMediaCount: remainingCount,
        viewAllTileIndex: allTileIndex,
        totalMediaCount: totalCount,
      };
    }, [mediaPreviewItems]);

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
            overflow: "hidden",
            minWidth: fullScreen ? '100%' : "800px",
          },
        },
      }}
    >
      <DialogContent className="flex flex-col gap-5">
        <div className="flex justify-between w-full">
          <p className="text-blue font-semibold text-base">Property Details</p>
          <Image
            onClick={() => {
              if (onClose) {
                onClose(false);
              }
            }}
            src="/assets/close-icon.svg"
            alt="close"
            width={24}
            height={24}
            className="cursor-pointer"
          />
        </div>
        <hr className="border-border"></hr>
        <div className="flex flex-col 2md:flex-row flex-wrap justify-between items-start  gap-3">
          <div className="flex text-text-blue flex-1 font-medium break-all">
            <p className="w-[30px]">ID:</p>
            <span className="text-text-gray text-sm">{propertyDetails?.id}</span>
          </div>
          <div className="flex flex-1 felx-start w-full 2md:w-[40%] flex-col gap-[2px]">
            <div className="flex justify-between">
            <p className="text-xs lg:text-sm text-text-gray">
              Listing Score
            </p>
            <p className="text-xs lg:text-sm text-text-black">{propertyDetails?.progressPercentage}%</p>
            </div>
            <BorderLinearProgress variant="determinate" value={propertyDetails?.progressPercentage} />
          </div>
          {propertyDetails?.status != 'deactivated' && <button onClick={() => {
            setOpenDeactivePopup(true)
          }} className="cursor-pointer bg-[#F32B2B1A] text-sm text-[#F32B2B] flex items-center gap-2 px-3 py-1.5 rounded-[5px] font-medium border border-[#F32B2B1A] hover:border-[#F32B2B]">
            <img src="/assets/deactivate-eye.svg" className="w-4 h-4"></img> Deactivate
          </button>}
          {
            propertyDetails?.status == 'deactivated' && <button onClick={() => {
            handleRepost({propertyId: propertyId})
          }} disabled={repostLoader} className="cursor-pointer bg-[#5e23dc] text-sm text-white flex items-center gap-2 px-3 py-1.5 rounded-[5px] font-medium border border-[#5e23dc]">
            <img src="/assets/repost.svg" className="w-4 h-4"></img> Repost
          </button>}
          
        </div>
        <div className="flex flex-col 2md:flex-row justify-between items-start 2md:items-center gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-base text-blue">
              {propertyDetails?.title}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={handleEdit} className="cursor-pointer  bg-[#01004833] hover:bg-light-purple text-sm py-1.5 text-blue flex items-center gap-2 px-4 py-1 rounded-[5px] font-medium">
              <img src="/assets/edit-blue.svg" className="w-4 h-4"></img> Edit Listing
            </button>
            <button className="bg-[#01004833] text-sm text-blue flex items-center gap-2 px-4 py-1.5 rounded-[5px] font-medium">
              <img src="/assets/share-blue.svg" className="w-4 h-4"></img> Share
            </button>
            <button className="bg-[#01004833] text-sm text-blue flex items-center gap-2 px-4 py-2 rounded-[5px] font-medium">
              <img src="/assets/more-blue.svg" className="w-4 h-4"></img>
            </button>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-3">
            <button style={{background: getStatusColor(propertyDetails?.status)?.color}} className="cursor-text text-sm text-white py-1 flex items-center gap-2 px-4 py-1 rounded-[5px] font-medium">
              {getStatusColor(propertyDetails?.status)?.name}
            </button>
            {propertyDetails?.area ? <button className="cursor-text border border-border text-sm text-text-gray py-1 flex items-center gap-2 px-4 py-1 rounded-[5px] font-medium">
              {propertyDetails?.area}
            </button> : ''}
            {propertyDetails?.category && <button className="cursor-text border border-border text-sm text-text-gray py-1 flex items-center gap-2 px-4 py-1 rounded-[5px] font-medium">
              {propertyDetails?.category}
            </button>}
             {propertyDetails?.furnishingType && <button className=" cursor-text border border-border text-sm text-text-gray py-1 flex items-center gap-2 px-4 py-1 rounded-[5px] font-medium">
              {propertyDetails?.furnishingType}
            </button>}

            {propertyDetails?.isVerified == 'verified' && <button className=" cursor-text border border-border text-sm text-text-gray py-1 flex items-center gap-2 px-4 py-1 rounded-[5px] font-medium">
              {'Property Verified'}
            </button>}
        </div>
        <div className="flex gap-3 justify-between">
          <div className="w-[80%] flex flex-col gap-3 flex-wrap">
            <p className="text-sm font-medium text-blue">Property Photos & Videos</p>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative h-[240px] w-full overflow-hidden rounded-[6px] lg:h-[320px] lg:w-[60%]">
                {mainMediaItem ? (
                  <>
                    {mainMediaItem.type === "video" ? (
                      <video
                        src={mainMediaItem.src + "?t=2"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={mainMediaItem.src}
                        alt="property media"
                        fill
                        className="object-cover"
                      />
                    )}
                    {mainMediaItem.type === "video" ? (
                      <div
                        onClick={() => {
                          handleOpenVideoPreview(mainMediaItem.src);
                        }}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center"
                      >
                        <div className="flex items-center justify-center rounded-full w-12 h-12 bg-[#01004866]">
                          <div className="flex items-center justify-center rounded-full w-10 h-10 bg-blue">
                            <Image alt="play" src="/assets/play-white.svg" width={16} height={16} />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div onClick={handleUploadPhoto} className="cursor-pointer h-full w-full border border-dashed border-gray-300 rounded-[6px] flex items-center justify-center">
                    <Image
                      src="/assets/upload-photo.svg"
                      alt="upload photo or video"
                      width={80}
                      height={80}
                    />
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[40%] grid grid-cols-2 gap-3">
                {sideMediaItems.map((item, index) => (
                  <div key={item.id} className="relative h-[114px] overflow-hidden rounded-[6px] sm:h-[154px] lg:h-full">
                    {item.type === "video" ? (
                      <video
                        src={item.src + "?t=2"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={item.src}
                        alt="property media"
                        fill
                        className="object-cover"
                      />
                    )}

                    {item.type === "photo" && item.view ? (
                      <p className="bg-[#00000099] text-white text-xs rounded-full absolute bottom-2 px-2 py-0.5 left-2">{item.view}</p>
                    ) : null}

                    {item.type === "video" ? (
                      <div
                        onClick={() => {
                          handleOpenVideoPreview(item.src);
                        }}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center"
                      >
                        <div className="flex items-center justify-center rounded-full w-10 h-10 bg-[#01004866]">
                          <div className="flex items-center justify-center rounded-full w-8 h-8 bg-blue">
                            <Image alt="play" src="/assets/play-white.svg" width={14} height={14} />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {index === viewAllTileIndex && extraMediaCount > 0 ? (
                      <div
                        onClick={handleUploadPhoto}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-sm font-semibold text-white"
                      >
                        View All({totalMediaCount}+)
                      </div>
                    ) : null}
                  </div>
                ))}

                {sideMediaItems.length < 4 ? (
                  <div onClick={handleUploadPhoto} className="cursor-pointer relative h-[114px] overflow-hidden rounded-[6px] border border-dashed border-gray-300 flex items-center justify-center sm:h-[154px] lg:h-full">
                    <Image
                      src="/assets/upload.svg"
                      alt="upload media"
                      width={40}
                      height={40}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
              {propertyDetails?.isVerified == 'unverified' && propertyDetails?.status == 'active' && <button disabled={verifyLoader} onClick={() => {
                  handleVerifyProperty({propertyId: propertyId})
                }} className="w-fit cursor-pointer bg-[#d5f3e8] text-sm text-[#008f4b] flex items-center gap-2 px-3 py-1.5 rounded-[5px] font-medium border border-[#d5f3e8] hover:border-[#008f4b]">
                  <img src="/assets/verify.svg" className="w-4 h-4"></img> {propertyDetails?.verificationStatus == 'rejected' ? 'Re Verify' : 'Verify'}
                </button>}
          </div>
        </div>
        <div className="flex flex-wrap flex-row gap-10">
          <div>
            <p className="text-blue font-medium text-base">{propertyDetails?.price ? 'Price:' : 'Rent:'}</p>
            <p className="text-text-gray text-base">{propertyDetails?.price ?? propertyDetails?.monthlyRent}</p>
          </div>
          {propertyDetails?.possessionDate && <div>
            <p className="text-blue font-medium text-base">Possession Date:</p>
            <p className="text-text-gray text-base">{propertyDetails?.possessionDate}</p>
          </div>}
          <div>
            <p className="text-blue font-medium text-base">Created On:</p>
            <p className="text-text-gray text-base">{propertyDetails?.createdOn ? moment(propertyDetails?.createdOn).format('DD MMM YYYY') : '-'}</p>
          </div>
          <div>
            <p className="text-blue font-medium text-base">Last Added:</p>
            <p className="text-text-gray text-base">{propertyDetails?.lastAddedOn ? moment(propertyDetails?.lastAddedOn).format('DD MMM YYYY') : '-'}</p>
          </div>
          <div>
            <p className="text-blue font-medium text-base">Leads</p>
            <p className="text-text-gray text-base">0</p>
          </div>
          <div>
            <p className="text-blue font-medium text-base">Expiring On</p>
            <p className="text-text-gray text-base">{propertyDetails?.expiresAt ? moment(propertyDetails?.expiresAt).format('DD MMM YYYY') : '-'}</p>
          </div>
        </div>
        <div>
          {propertyDetails?.status == 'rejected' && <div className="flex flex-col">
            <p className="text-blue font-medium text-base">Reject Reason:</p>
            <p className="text-text-gray text-base">{propertyDetails?.rejectionReason}</p>
          </div>}
        </div>
        <div>
          {propertyDetails?.verificationStatus == 'rejected' && <div className="flex flex-col">
            <p className="text-blue font-medium text-base">Verify Reject Reason:</p>
            <p className="text-text-gray text-base">{propertyDetails?.comments}</p>
          </div>}
        </div>
      </DialogContent>
      <VideoPreviewDialog
        open={openVideoPreview}
        videoUrl={videoPreviewUrl}
        onClose={handleClosePreview}
        />

        {
          openDeactivePopup && <DeactivateProperty open={openDeactivePopup} propertyId={propertyId} onClose={(isUpdate) => {
            setOpenDeactivePopup(false)
            onClose(isUpdate)
          }}/>
        }
        <VerifyPropertyLink open={oepnverifyPopup} onClose={() => {
          setOpenVerifyPopup(false)
          setVerifyLink(null)
        }} link={verifyLink}/>
    </Dialog>
  );
};

export default PropertyView;
