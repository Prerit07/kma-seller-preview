'use client';

import { useRef, useState, useEffect } from 'react';
import Photoupload from './imageupload';
import { getFileUploadUrlApiHandler, GetFileUploadUrlPayload, GetFileUploadUrlResponse, uploadFileToS3ApiHandler, UploadFileToS3Payload, UploadFileToS3Response } from '@/services/masterService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { livePhotoGetApiHandler, LivePhotoGetResponse, LivePhotoPayload, LivePhotoResponse, livePhotoUploadApiHandler } from '@/services/kycService';
import FullscreenSpinner from '../common/spinner/fullScreenSpinner';
import { useRouter } from 'nextjs-toploader/app';

export default function UploadPhoto() {
  const router = useRouter()
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPhotoApproved, setIsPhotoApproved] = useState(false)
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
  };

  const startCamera = async () => {
  if (
    typeof window === 'undefined' ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    alert('Camera not supported on this device or browser.');
    return;
  }

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    }); 

    setStream(mediaStream);
    setShowCamera(true);

  } catch (error) {
    console.error('Camera access error:', error);
    alert('Camera permission denied.');
  }
};

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], 'camera-photo.jpg', {
        type: 'image/jpeg',
      });

      setFile(capturedFile);
      setPreview(URL.createObjectURL(capturedFile));
      stopCamera();
    }, 'image/jpeg');
  };

  const { mutate: handleFileUpload } = useMutation({
    mutationFn: async (
      payload: UploadFileToS3Payload
    ): Promise<UploadFileToS3Response> => {
      return await uploadFileToS3ApiHandler(payload);
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

  const { mutate: handleGetFileUrl, isPending: ownerLoader } = useMutation({
    mutationFn: async (
      payload: GetFileUploadUrlPayload
    ): Promise<GetFileUploadUrlResponse> => {
      return await getFileUploadUrlApiHandler(payload);
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

  const { mutate: hanldeLivePhotoUpload, isPending: uploadLoader } = useMutation({
    mutationFn: async (
      payload: LivePhotoPayload
    ): Promise<LivePhotoResponse> => {
      return await livePhotoUploadApiHandler(payload);
    },
    onSuccess: (response: LivePhotoResponse) => {
        toast.success(response.message)
        router.push('/kyc?tabName=Aadhar Verification')
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

  const { data: uploadDetails, isLoading: detailsLoader } = useQuery({
    queryKey: ["live-photo"],
    queryFn: async (): Promise<LivePhotoGetResponse> => {
      return livePhotoGetApiHandler();
    },
    select: (resposne: LivePhotoGetResponse) => {
      return resposne;
    },
    staleTime: 0,
    refetchOnMount: true,
  });


  const uploadFileHanlder = () => {
    if(!file){
      return
    }
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
                  onSuccess: () => {
                   hanldeLivePhotoUpload({live_photo_url: response.data.key})
                  },
                }
              );
            } else {
              toast.error(`Failed to get upload URL for ${file.name}`);
            }
          },
        }
      );
  }

  const clearData = () => {
    setFile(null)
    stopCamera()
    setPreview(null)
    router.push('/user-dashboard')
  }

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  },[stream])

  useEffect(() => {
    if(uploadDetails){
        const url = process.env.NEXT_PUBLIC_AWS_URL
        if(uploadDetails.live_photo_url){
          setPreview(url + uploadDetails.live_photo_url)
        }
        setIsPhotoApproved(uploadDetails?.live_photo_approved)
    }
  },[uploadDetails])

  return (

    <>
    { detailsLoader ?
        <FullscreenSpinner/> : 
    
    
    <div className="w-[100%] lg:w-[60%] space-y-3">
      {/* Upload from system */}
      {!isPhotoApproved && <Photoupload
        onUpload={(file) => {
            handleUpload(file[0])
        }}
        type="photo"
        accept="image/jpeg, image/jpg, image/png"
        label="Drag and drop file here"
        subLabel="Max. size 20 MB • Formats: PNG, JPG, JPEG"
      />}

      {!isPhotoApproved && <p className='text-text-black font-bold text-center'>OR</p>}

      {/* Camera actions */}
      {(!isPhotoApproved && !showCamera) && (
        <button
          onClick={startCamera}
          className="w-full py-2 rounded-full border border-blue text-blue font-medium"
        >
          Take Photo Using Camera
        </button>
      )}

      {/* Camera view */}
      {showCamera && (
        <div className="flex flex-col items-center gap-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded-xl w-full max-w-md border"
          />

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-4">
            <button
              onClick={capturePhoto}
              className="px-6 py-2 rounded-full bg-blue text-white"
            >
              Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-2 rounded-full border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-medium">Preview</p>
          <img
            src={preview}
            alt="Preview"
            className="w-48 h-48 object-cover rounded-xl border"
          />
        </div>
      )}

      {/* Submit / Cancel */}
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        <button onClick={clearData} className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
          <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap font-medium`}>Cancel</p>
            </span>
        </button>

        {!isPhotoApproved && <button
          className="cursor-pointer w-full md:w-[130px] px-12 py-3 animated-button border border-blue"
          onClick={() => {
            stopCamera()
            uploadFileHanlder()
          }}
          disabled={ownerLoader || uploadLoader}
        >
          <span className="gap-3 relative flex justify-center">
                <p className={`text-nowrap`}>{'Submit'}</p>
            </span>
        </button>}
      </div>
    </div>

        }
     </>
  );
}
