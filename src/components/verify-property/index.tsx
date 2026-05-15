"use client";
import {
  getPropertyPhotoTypeListApiHandler,
  GetPropertyPhotoTypeListResponse,
  submitPropertyVerificationApiHandler,
  SubmitPropertyVerificationPayload,
  SubmitPropertyVerificationResponse,
} from "@/services/postProperty";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import DynamicSelect from "../common/select";
import {
  getFileUploadUrlApiHandler,
  GetFileUploadUrlPayload,
  GetFileUploadUrlResponse,
  uploadFileToS3ApiHandler,
  UploadFileToS3Payload,
  UploadFileToS3Response,
} from "@/services/masterService";
import { toast } from "react-toastify";
import Image from "next/image";
import VideoPreviewDialog from "../common/videoPreview";
import Spinner from "../common/spinner";
import { useSearchParams } from "next/navigation";
import { SwitchCamera } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

const mediaTypeOptions = [
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
];

export default function VerifyProperty() {
  const imageBaseUrl = process.env.NEXT_PUBLIC_AWS_URL;
  const [facingMode, setFacingMode] = useState("environment"); // default back
  const videoRef = useRef(null);
  const toastRef = useRef(null);
  const videoTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter()

  const [coords, setCoords] = useState(null);
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const [openVideoPreview, setOpenVideoPreview] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  /* ---------- PERMISSIONS ---------- */
  const [cameraGranted, setCameraGranted] = useState(false);

  /* ---------- MODE ---------- */
  const [mediaType, setMediaType] = useState(null);

  /* ---------- CAMERA ---------- */
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  /* ---------- PHOTO ---------- */
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedView, setSelectedView] = useState(null);
  const [imageTypeError, setImageTypeError] = useState('')

  /* ---------- VIDEO ---------- */
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoTimer, setVideoTimer] = useState(0);

  /* ---------- UPLOAD LIST ---------- */
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  const handleOpenVideoPreview = (url) => {
    setOpenVideoPreview(true);
    setVideoPreviewUrl(url);
  };
  const handleClosePreview = () => {
    setOpenVideoPreview(false);
    setVideoPreviewUrl(null);
  };

  const { data: propertyPhotoTypeList, isPending: photoListLoader } = useQuery({
    queryKey: ["photo-type-list"],
    queryFn: getPropertyPhotoTypeListApiHandler,
    select: (resposne: GetPropertyPhotoTypeListResponse[]) => {
      return Array.isArray(resposne)
        ? resposne.map((item) => ({ label: item.name, value: item.name })) ?? []
        : [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  /* ---------- PERMISSION CHECK ---------- */

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      alert(`Geolocation not supported`);
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state == "granted" || permission.state == "prompt") {
        navigator.geolocation.getCurrentPosition(
          (pos) => {

            setCoords({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              state: permission.state,
            });
            setLocationGranted(true);
          },
          (error) => {
            setCoords({
              error: error.message,
            });
            //   setLocationGranted(false);
          }
        );
      } else {
        // Permission is denied
        setShowLocationHelp(true);
      }
    } catch {
      // Fallback (older Safari)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLocationGranted(true);
        },
        () => setShowLocationHelp(true)
      );
    }
  };

  useEffect(() => {
    (async () => {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permission.state == "granted" || permission.state == "prompt") {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setCoords({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                state: permission.state,
              });
              setLocationGranted(true);
            },
            (error) => {
              setCoords({
                error: error.message,
              });
              setLocationGranted(false);
            }
          );
        }
        const cam = await navigator.permissions.query({ name: "camera" });
        if (cam.state === "granted") setCameraGranted(true);
      }
    })();
  }, []);

  /* ---------- CAMERA HELPERS ---------- */
  const startCamera = async (mode = facingMode, isNewStrem = false) => {
    if (!isNewStrem && stream) return;

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode },
    });

    setStream(mediaStream);
    setCameraActive(true);

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  };

  const stopCamera = () => {
    if (!stream) return;

    stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /* ---------- MEDIA TYPE CHANGE ---------- */
  const onMediaTypeChange = async (option) => {
    setMediaType(option);

    setPhotoBlob(null);
    setPhotoPreview(null);
    setVideoBlob(null);
    setVideoPreview(null);
    setSelectedView(null);

    await startCamera(facingMode);
  };

  /* ---------- PHOTO ---------- */
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setPhotoBlob(file); // now a FILE, not blob
      setPhotoPreview(URL.createObjectURL(file));

      stopCamera();
    }, "image/jpeg");
  };

  /* ---------- VIDEO ---------- */
  const startRecording = () => {
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });

      const file = new File([blob], `video-${Date.now()}.webm`, {
        type: blob.type,
      });
      setVideoBlob(file);
      setTimeout(() => {
        setVideoPreview(URL.createObjectURL(file));
      }, 100);
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
      setVideoTimer(0)
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);

    videoTimerRef.current = setInterval(() => {
      setVideoTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopCamera();

    setVideoTimer(0)
    clearInterval(videoTimerRef.current);
    videoTimerRef.current = null;
  };

  /* ---------- SAVE ---------- */
  const saveMedia = () => {
    if(mediaType?.value == 'photo' && !selectedView){
      setImageTypeError('Select the Image type')
      return
    }

    if (mediaType.value === "photo") {
      handleGetFileUrl(
        {
          contentType: photoBlob?.type,
          filename: photoBlob?.name,
          expiresIn: 3600,
          folder: process.env.NEXT_PUBLIC_AWS_FOLDER,
        },
        {
          onSuccess: (response: GetFileUploadUrlResponse) => {
            if (response.success) {
              handleFileUpload(
                { url: response.data.url, file: photoBlob },
                {
                  onSuccess: (fileResponse: UploadFileToS3Response) => {
                    if (fileResponse.status === 200) {
                      setPhotos((pre) => [
                        ...pre,
                        {
                          fileKey: response.data.key,
                          view: selectedView?.value,
                        },
                      ]);
                    } else {
                      toast.error(`Error uploading ${photoBlob.name}`);
                    }
                  },
                }
              );
            } else {
              toast.error(`Failed to get upload URL for ${photoBlob.name}`);
            }
          },
        }
      );
    } else {
      handleGetFileUrl(
        {
          contentType: videoBlob?.type,
          filename: videoBlob?.name,
          expiresIn: 3600,
          folder: process.env.NEXT_PUBLIC_AWS_FOLDER,
        },
        {
          onSuccess: (response: GetFileUploadUrlResponse) => {
            if (response.success) {
              handleFileUpload(
                { url: response.data.url, file: videoBlob },
                {
                  onSuccess: (fileResponse: UploadFileToS3Response) => {
                    if (fileResponse.status === 200) {
                      setVideos((pre) => [
                        ...pre,
                        {
                          fileKey: response.data.key,
                          format: videoBlob?.type,
                        },
                      ]);
                    } else {
                      toast.error(`Error uploading ${videoBlob.name}`);
                    }
                  },
                }
              );
            } else {
              toast.error(`Failed to get upload URL for ${videoBlob.name}`);
            }
          },
        }
      );
    }

    setMediaType(null);
    setPhotoPreview(null);
    setVideoPreview(null);
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

  const { mutate: submitPropertyVerification, isPending: submitLoader } =
    useMutation({
      mutationFn: async (
        payload: SubmitPropertyVerificationPayload
      ): Promise<SubmitPropertyVerificationResponse> => {
        return await submitPropertyVerificationApiHandler(payload);
      },
      onSuccess: (response: SubmitPropertyVerificationResponse) => {
        toast.success(response?.message)
        setVideos([])
        setPhotos([])
        router.push('/')
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

    const handleFinalSubmit = () => {
      let payload = {
        verificationToken: token,
        livePhotos: photos,
        liveVideos: videos,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        // latitude: '21.23452',
        // longitude: '72.91567'
      } 
      submitPropertyVerification(payload)
    }

    const handleDelete = (type, key) => {
      if(type == 'photo'){
        let updatedPhotoList = photos.filter(item => item.fileKey != key)
        setPhotos(updatedPhotoList)
      }else{
        let updatedVideoList = videos.filter(item => item.fileKey != key)
        setVideos(updatedVideoList)
      }
    }

    const switchCamera = async () => {
      const newMode = facingMode == "user" ? "environment" : "user";
      setFacingMode(newMode);
      setStream(null)
      setVideoTimer(0)
      setRecording(false)
      await startCamera(newMode, true);
};

  useEffect(() => {
    if (stream) {
      videoRef.current.srcObject = stream;
    }
    return () => stopCamera();
  }, [cameraActive]);

  const PermissionScreen = ({ title, description, action }) => (
    <div className="h-screen flex flex-col justify-center items-center p-6 text-center space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-600">{description}</p>
      <button
        className="cursor-pointer w-full md:w-[130px] px-12 py-3 animated-button border border-blue"
        onClick={action}
      >
        <span className="gap-3 relative flex justify-center">
          <p className={`text-nowrap`}>Allow</p>
        </span>
      </button>
    </div>
  );

  if (!locationGranted) {
    return (
      <>
        <p>
          {coords?.latitude} {coords?.longitude} {coords?.state} {coords?.error}
        </p>
        <PermissionScreen
          title="Allow Location"
          description="Location is required to verify property"
          action={requestLocation}
        />
        {showLocationHelp && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl p-6 max-w-sm text-center space-y-4">
              <h3 className="text-lg font-semibold">Location Required</h3>
              <p className="text-sm text-gray-600">
                Location access is blocked. Please enable it from your browser
                settings to continue.
              </p>

              <ul className="text-left text-sm text-gray-500 space-y-1">
                <li>• Tap the 🔒 lock icon in the address bar</li>
                <li>• Enable Location access</li>
                <li>• Refresh the page</li>
              </ul>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-light-purple text-text-black cursor-pointer rounded-lg"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!cameraGranted) {
    return (
      <>
        <PermissionScreen
          title="Allow Camera"
          description="Camera is required to verify property"
          action={async (mode = facingMode) => {
            await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
            setCameraGranted(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-col p-4 space-y-4">
      <div className="flex flex-col gap-3 w-full p-3 sm:w-[380px]">
      <h1 className="text-xl font-semibold text-center">
        Property Verification
      </h1>

      <DynamicSelect
        placeholder="Select Camera Type"
        minHeight="40px"
        options={mediaTypeOptions}
        value={mediaType}
        onChange={(val) => {
          onMediaTypeChange(val);
        }}
        fontwidth="16px"
      />

      {cameraActive && (
        <>
         <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl border"
          />
          <button
            onClick={switchCamera}
            className="absolute cursor-pointer bottom-4 right-4 bg-black/60 text-white p-2 rounded-full"
          >
            <SwitchCamera fontSize={16}/>
          </button>
          </div>
          {mediaType?.value == "video" && (
            <div>
              <p className="text-center text-red-600 font-semibold">
                Recording: {videoTimer}s
              </p>
            </div>
          )}
        </>
      )}

      {/* PHOTO */}
      {mediaType?.value === "photo" && cameraActive && (
        <div className="flex justify-center">
          <button
            onClick={capturePhoto}
            className="w-fit text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
          >
            <span className="gap-3 relative flex justify-center">
              Capture Photo
            </span>
          </button>
        </div>
      )}

      {photoPreview && (
        <>
          <img src={photoPreview} className="rounded-xl" />
          <DynamicSelect
            placeholder="Select view"
            minHeight="40px"
            options={propertyPhotoTypeList}
            value={selectedView}
            onChange={(val) => {
              setSelectedView(val);
              setImageTypeError('')
            }}
            fontwidth="16px"
          />
          {imageTypeError && (
            <p className="text-red-500 text-xs">{imageTypeError}</p>
          )}
        </>
      )}

      {/* VIDEO */}
      {mediaType?.value === "video" && cameraActive && (
        <>
          {!recording ? (
            <div className="flex justify-center">
              <button
                onClick={startRecording}
                className="w-fit text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
              >
                <span className="gap-3 relative flex justify-center">
                  Start Recording
                </span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={stopRecording}
                className="w-fit text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
              >
                <span className="gap-3 relative flex justify-center">
                  Stop Recording
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {videoPreview && (
        <>
          <video key={videoPreview} src={videoPreview} playsInline controls preload="metadata" className="rounded-xl" />
        </>
      )}

      {(photoPreview || videoPreview) && (
        <div className="flex justify-center">
          <button
            disabled={ownerLoader || fileLoader}
            onClick={saveMedia}
            className="w-full md:w-[130px] text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
          >
            <span className="gap-3 relative flex justify-center">
              {!ownerLoader || !fileLoader ? (
                <p className={`text-nowrap`}>Upload</p>
              ) : (
                <Spinner size={20} className="h-[24px]" />
              )}
            </span>
          </button>
        </div>
      )}
      </div>

      {photos.length > 0 && (
        <MediaList title="Photos" items={photos} imageBaseUrl={imageBaseUrl} handleDelete={handleDelete}/>
      )}
      {videos.length > 0 && (
        <VideoMediaList
          title="Videos"
          items={videos}
          imageBaseUrl={imageBaseUrl}
          handleOpenVideoPreview={handleOpenVideoPreview}
          handleDelete={handleDelete}
        />
      )}

      <VideoPreviewDialog
        open={openVideoPreview}
        videoUrl={videoPreviewUrl}
        onClose={handleClosePreview}
      />

      {(photos.length >= 2 || videos.length > 0) && (
        <div className="flex justify-center">
          <button
            disabled={submitLoader}
            onClick={handleFinalSubmit}
            className="w-fit text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
          >
            <span className="gap-3 relative flex justify-center">
              {!submitLoader ? (
                <p className={`text-nowrap`}>Submit uploded media</p>
              ) : (
                <Spinner size={20} className="h-[24px]" />
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- COMPONENT ---------- */

const MediaList = ({ title, items, imageBaseUrl, handleDelete }) => (
  <div>
    <h3 className="text-base pb-2 font-semibold">{title}</h3>
    <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
      {Array.isArray(items) &&
        items.map((item) => {
          return (
            <div className="relative">
              <Image
                src={imageBaseUrl + item.fileKey}
                alt="property photo"
                width={600}
                height={600}
                className="aspect-video rounded-[5px]"
              />
              <p className="bg-[#00000099] text-white text-sm rounded-full absolute bottom-2 px-2 py-0.5 left-2">
                {item.view}
              </p>
              <button onClick={() => handleDelete('photo', item.fileKey)} className="bg-[#00000055] text-white text-sm rounded-full absolute top-2 p-2 cursor-pointer right-2">
                <Image src='/assets/delete.svg' width={15} height={15} alt="delete" />
              </button>
            </div>
          );
        })}
    </div>
  </div>
);

const VideoMediaList = ({
  title,
  items,
  imageBaseUrl,
  handleOpenVideoPreview,
  handleDelete
}) => (
  <div>
    <h3 className="text-base pb-2 font-semibold">{title}</h3>
    {items.map((i, idx) => (
      <div key={idx} className="text-sm text-gray-600">
        {i.key}
      </div>
    ))}
    <div className="grid grid-cols-[1fr] lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
      {Array.isArray(items) &&
        items.map((item) => {
          return (
            <div className="relative">
              <video
                src={imageBaseUrl + item.fileKey + "?t=0.002"}
                className="rounded-[10px] w-full aspect-video object-cover"
                preload="metadata"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex cursor-pointer items-center justify-center rounded-full w-12 h-12 bg-[#01004866]">
                  <div
                    onClick={() => {
                      handleOpenVideoPreview(imageBaseUrl + item.fileKey);
                    }}
                    className="flex items-center justify-center rounded-full w-10 h-10 bg-blue"
                  >
                    <Image
                      alt="play"
                      src="/assets/play-white.svg"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete('video', item.fileKey)} className="bg-[#00000055] text-white text-sm rounded-full absolute top-2 p-2 cursor-pointer right-2">
                <Image src='/assets/delete.svg' width={15} height={15} alt="delete" />
              </button>
            </div>
          );
        })}
    </div>
  </div>
);
