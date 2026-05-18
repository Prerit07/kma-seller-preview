import { useStepProgress } from "@/api/hooks/useStepProgress";
import PhotoViewer, { OptionType } from "../common/photoViewer";
import ImageUpload from "../common/upload";
import FieldLabel from "./fieldLabel";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getActiveStep, resetProgress, setActiveStep, setTotalProgress } from "@/store/postPropertyProgress";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getFileUploadUrlApiHandler,
  GetFileUploadUrlPayload,
  GetFileUploadUrlResponse,
  uploadFileToS3ApiHandler,
  UploadFileToS3Payload,
  UploadFileToS3Response,
} from "@/services/masterService";
import { toast } from "react-toastify";
import VideoPreviewDialog from "../common/videoPreview";
import {
  getPropertyPhotoTypeListApiHandler,
  GetPropertyPhotoTypeListResponse,
  Step1DetailsResponse,
  step1PostPropertyDetailsApiHandler,
  Step4DetailsResponse,
  step4PostPropertyCreateApiHandler,
  step4PostPropertyDetailsApiHandler,
  Step4PostPropertyPayload,
  Step4PostPropertyResponse,
} from "@/services/postProperty";
import Spinner from "../common/spinner";
import FullscreenSpinner from "../common/spinner/fullScreenSpinner";

export default function Step4({containerRef}) {
  const params = useParams();
  const toastRef = useRef(null);
  const router = useRouter()
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const activeStep = useSelector(getActiveStep);
  const dispatch = useDispatch();

  const [basicStaticDetail, setBasicStaticDetail] = useState({
    propertyListFor: null,
    propertyCategory: null,
    propertyType: null,
  })

  const [photoList, setPhotoList] = useState([]);
  const [videoList, setVideoList] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});

  //Video Preview
  const [openVideoPreview, setOpenVideoPreview] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");


  const validate = () => {
    let hasError = false;
    let updatedErrors: any = {};

    if (photoList.length < 2) {
      updatedErrors.photo = "Minimun 2 photos required";
      hasError = true;
    }

    if (photoList.length >= 2) {
      let isCoverImageSelected = photoList.some((item) => item.isCoverImage);
      if (!isCoverImageSelected) {
        updatedErrors.cover = `Set one cover image from ${photoList.length} image`;
        hasError = true;
      }
    }

    if (photoList.length >= 2) {
      let isAllviewSelected = photoList.every((item) => item.view?.value);
      if (!isAllviewSelected) {
        updatedErrors.view = `Select view of image`;
        hasError = true;
      }
    }
    setErrors(updatedErrors);
    return hasError;
  };

  const { mutate: handleFileUpload, isPending: fileLoader } = useMutation({
    mutationFn: async (
      payload: UploadFileToS3Payload
    ): Promise<UploadFileToS3Response> => {
      return await uploadFileToS3ApiHandler(payload);
    },
    onError: (error: any) => {
      toast.dismiss(toastRef.current);
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const { mutate: handleGetFileUrl, isPending: ownerLoader } = useMutation({
    mutationFn: async (
      payload: GetFileUploadUrlPayload
    ): Promise<GetFileUploadUrlResponse> => {
      return await getFileUploadUrlApiHandler(payload);
    },
    onError: (error: any) => {
      toast.dismiss(toastRef.current);
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

const handleUploadFileToS3 = async (files: File[], type: string) => {
  if (type == 'image' && photoList.length + files.length > 50) {
    toast.error("Max 50 photos can be uploaded");
    return;
  }

  if (type == 'video' && videoList.length + files.length > 5) {
    toast.error("Max 5 videos can be uploaded");
    return;
  }

  toastRef.current = toast.loading("Uploading files...");

  for (const file of files) {
    await new Promise<void>((resolve) => {
      handleGetFileUrl(
        {
          contentType: file.type,
          filename: file.name,
          expiresIn: 3600,
          folder: process.env.NEXT_PUBLIC_AWS_FOLDER,
        },
        {
          onSuccess: (response: GetFileUploadUrlResponse) => {
            if (response.success) {
              handleFileUpload(
                { url: response.data.url, file },
                {
                  onSuccess: (fileResponse: UploadFileToS3Response) => {
                    if (fileResponse.status === 200) {
                      if (type === "image") {
                        setPhotoList((pre) => [
                          ...pre,
                          {
                            fileKey: response.data.key,
                            url: process.env.NEXT_PUBLIC_AWS_URL + response.data.key,
                            view: null,
                            isCoverImage: false,
                          },
                        ]);
                      } else if (type === "video") {
                        setVideoList((pre) => [
                          ...pre,
                          {
                            fileKey: response.data.key,
                            url:
                              process.env.NEXT_PUBLIC_AWS_URL +
                              response.data.key +
                              "#t=5",
                          },
                        ]);
                      }
                    } else {
                      toast.error(`Error uploading ${file.name}`);
                    }
                    resolve();
                  },
                }
              );
            } else {
              toast.error(`Failed to get upload URL for ${file.name}`);
              resolve();
            }
          },
        }
      );
    });
  }

  toast.dismiss(toastRef.current);
  setErrors((pre) => ({...pre, photo: ''}))
};


  const handleDeletePhoto = (id: string) => {
    let updatedPhotolist = photoList.filter((_, index) => String(index) != id);
    setPhotoList(updatedPhotolist);
    setErrors({});
  };

  const handleDeleteVideo = (id: string) => {
    let updatedPhotolist = videoList.filter((_, index) => String(index) != id);
    setVideoList(updatedPhotolist);
  };

  const handleOpenVideoPreview = (url: string) => {
    if(url){
      const cleanUrl = url?.split('#')[0];
      setVideoPreviewUrl(cleanUrl ?? '');
      setOpenVideoPreview(true);
    }
  };

  const handleClosePreview = () => {
    setOpenVideoPreview(false);
    setVideoPreviewUrl(null);
  };

  const handleCoverChange = (checked: boolean, id: string) => {
    let updatedFile = [...photoList];
    updatedFile = updatedFile.map((item, index) => {
      if (String(index) == id) {
        return { ...item, isCoverImage: checked };
      } else {
        return { ...item, isCoverImage: false };
      }
    });
    setPhotoList(updatedFile);
    setErrors((pre) => ({...pre, cover: ''}))
  };

  const handleRoomChange = (value: OptionType, id: string) => {
    let updatedFile = [...photoList];
    updatedFile = updatedFile.map((item, index) => {
      if (String(index) == id) {
        return { ...item, view: value };
      }
      return item;
    });
    setPhotoList(updatedFile);
    setErrors((pre) => ({...pre, view: ''}))
  };

  const { data: propertyPhotoTypeList, isPending: photoListLoader } = useQuery({
    queryKey: ["step4-details"],
    queryFn: getPropertyPhotoTypeListApiHandler,
    select: (resposne: GetPropertyPhotoTypeListResponse[]) => {
      return Array.isArray(resposne) ? resposne.map(item => ({label: item.name, value: item.name})) ?? [] : []
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: step4Details, isPending: step4DetailsLoader } = useQuery({
    queryKey: ["step4-details", params?.propertyId],
    queryFn: async (): Promise<Step4DetailsResponse> => {
      return step4PostPropertyDetailsApiHandler(
        String(params?.propertyId ?? "")
      );
    },
    select: (resposne: Step4DetailsResponse) => {
      return resposne;
    },
    enabled: params?.propertyId ? true : false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const generatePayload = () => {
    let photos = photoList.map((item) => {
      return {
        fileKey: item.fileKey,
        view: item.view.value,
        isCoverImage: item.isCoverImage,
      };
    });
    let videos = videoList.map((item) => {
      return {
        fileKey: item.fileKey,
        format: item.fileKey.substring(item.fileKey.lastIndexOf('.') + 1),
      };
    });
    return {
      propertyId: String(params?.propertyId),
      photos: photos,
      videos: videos,
    };
  };

  const { mutate: handleStep4Submit, isPending: step4Loader } = useMutation({
    mutationFn: async (
      payload: Step4PostPropertyPayload
    ): Promise<Step4PostPropertyResponse> => {
      return await step4PostPropertyCreateApiHandler(payload);
    },
    onSuccess: (response: Step4PostPropertyResponse) => {
      // dispatch(setActiveStep({ step: activeStep + 1 }));
      if(toastRef.current){
        toast.dismiss(toastRef.current);
      }
      toast.success('Post Property created successfully')
      dispatch(resetProgress())
      dispatch(setActiveStep({step: 1}))
      if(redirectTo == 'true'){
        router.replace(`/my-listing?propertyId=${params?.propertyId}`)
      }else{
        router.replace('/user-dashboard')
      }
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const { data: step1Details, isPending: step1DetailsLoader } = useQuery({
      queryKey: ["step1-in-4-details", params?.propertyId],
      queryFn: async (): Promise<Step1DetailsResponse> => {
        return step1PostPropertyDetailsApiHandler(
          String(params?.propertyId ?? "")
        );
      },
      select: (resposne: Step1DetailsResponse) => {
        return resposne;
      },
      enabled: params?.propertyId ? true : false,
      staleTime: 0,
      refetchOnMount: true,
    });

  useEffect(() => {
      if (step1Details) {
        setBasicStaticDetail((pre) => ({
            ...pre,
            propertyListFor: step1Details?.listingType,
            propertyCategory: step1Details?.category,
            propertyType: step1Details?.propertyType,
        }))
        dispatch(setTotalProgress({progress: step1Details.progressPercentage}))
      }
    }, [step1Details]);

  useEffect(() => {
    if (step4Details) {
      let photo = step4Details.photos.map((item) => {
        return {
          fileKey: item.fileKey,
          url: process.env.NEXT_PUBLIC_AWS_URL + item.fileKey,
          view: { label: item.view, value: item.view },
          isCoverImage: item.isCoverImage,
        };
      });
      let video = step4Details.videos.map((item) => {
        return {
          fileKey: item.fileKey,
          url: process.env.NEXT_PUBLIC_AWS_URL + item.fileKey + "#t=5",
        };
      });

      setPhotoList(photo);
      setVideoList(video);
    }
  }, [step4Details]);

  return (
    <>
    {((step1DetailsLoader || step4DetailsLoader) && params?.propertyId) ? <FullscreenSpinner/> : <>
      <div className="flex flex-col gap-4" ref={containerRef}>
        <p className="text-text-black font-semibold text-lg 2md:text-xl pb-2">
          Amenities & Description
        </p>

        <div>
          <FieldLabel label="Add Property Photos" />
          <FieldLabel
            label="Upload clear images to attract more buyers or tenants."
            customClass="text-text-gray font-normal! text-xs!"
          />
        </div>
        <div className="grid grid-cols-[1fr] lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
          <div className=" flex-1">
            {" "}
            {/*min-w-[230px]*/}
            <ImageUpload
              onUpload={(file) => {
                handleUploadFileToS3(file, "image");
              }}
              type='photo'
              accept={"image/jpeg, image/jpg, image/png, image/gif, image/webp"}
              label="Drag and drop file here"
              subLabel="Upto 50 photos • Max. size 20 MB • Formats: PNG, JPG, JPEG, GIF, WEBP"
            />
          </div>
          {photoList.map((item, index) => {
            return (
              <div className="">
                {" "}
                {/*flex-1 min-w-[230px]*/}
                <PhotoViewer
                  data={item}
                  type="photo"
                  onDelete={handleDeletePhoto}
                  id={String(index)}
                  onCoverChange={handleCoverChange}
                  onRoomChange={handleRoomChange}
                  options={propertyPhotoTypeList ?? []}
                />
              </div>
            );
          })}
        </div>
        <div>
          {errors?.photo && (
            <p className="pt-1 text-red-500 text-xs">{errors.photo}</p>
          )}
          {errors?.cover && (
            <p className="pt-1 text-red-500 text-xs">{errors.cover}</p>
          )}
          {errors?.view && (
            <p className="pt-1 text-red-500 text-xs">{errors.view}</p>
          )}
        </div>
        <div>
          <FieldLabel label="Add Property Videos" />
          <FieldLabel
            label="Add a walkthrough video to give buyers a better view of your property."
            customClass="text-text-gray font-normal! text-xs!"
          />
        </div>
        <div className="grid grid-cols-[1fr] lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
          {" "}
          {/*flex flex-wrap*/}
          <div className="">
            <ImageUpload
              onUpload={(file) => {
                handleUploadFileToS3(file, "video");
              }}
              type='video'
              accept={"video/mp4,video/mov,video/avi,video/mkv,video/webm"}
              label="Drag and drop file here"
              subLabel="Upto 5 video • Max. size 50 MB • Formats: MP4, MOV, AVI, MKV"
            />
          </div>
          {videoList.map((item, index) => {
            return (
              <div className="flex-1 min-w-[230px]">
                <PhotoViewer
                  data={item}
                  type="video"
                  onDelete={handleDeleteVideo}
                  id={String(index)}
                  previewVideo={handleOpenVideoPreview}
                />
              </div>
            );
          })}
        </div>
        <VideoPreviewDialog
          open={openVideoPreview}
          videoUrl={videoPreviewUrl}
          onClose={handleClosePreview}
        />
      </div>
      <div className="flex justify-center lg:justify-end w-full">
        <div className="flex flex-wrap justify-start flex-row gap-2 items-center mt-8">
          <button
            onClick={() => {
              if (activeStep != 1) {
                const propertyType = basicStaticDetail.propertyType?.code
                const isStep3Skipped = ['res-sale-plot', 'res-sale-agri-land', 'com-rent-warehouse', 'com-sale-warehouse', 'com-rent-plot', 'com-sale-plot'].includes(propertyType ?? '')
                if(isStep3Skipped){
                  dispatch(setActiveStep({step: activeStep - 2}))
                }else{
                  dispatch(setActiveStep({step: activeStep - 1}))
                }
              }
            }}
            className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple"
          >
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap font-medium`}>Back</p>
            </span>
          </button>
          <button
            disabled={step4Loader || fileLoader}
            onClick={() => {
              if (activeStep == 4) {
                if (validate()) {
                  return;
                }
                let payload = generatePayload();
                handleStep4Submit(payload);
              }
            }}
            className="w-full md:w-[130px] text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
          >
            <span className="gap-3 relative flex justify-center">
               {(!step4Loader || !fileLoader) ? (
                <p className={`text-nowrap`}>{activeStep == 4 ? 'Submit' : 'Next'}</p>
              ) : (
                <Spinner size={20} className="h-[24px]"/>
              )}
            </span>
          </button>
        </div>
      </div>
    </>}
    </>
  );
}
