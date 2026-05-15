"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface ImageUploadProps {
  onUpload: (file: File[]) => void;
  label?: string;
  accept?: string;
  subLabel: string;
  type: string;
}

export default function ImageUpload({
  onUpload,
  label = "Upload Image",
  accept = "image/jpeg,image/png,image/jpg,image/gif,image/webp",
  subLabel,
  type
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const maxSizeMB = type == 'photo' ? 20 : 50;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const validTypes = accept.split(",").map(item => item.trim());

 
  const validateFile = (file: File) => {
    if (file.size > maxSizeBytes) {
      toast.error(`${file.name} exceeds ${maxSizeMB} MB.`);
      return false;
    }
    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name} is not a supported format.`);
      return false;
    }
    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let validFile = []
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        // onUpload(file);
        validFile.push(file)
      }
    });
    onUpload(validFile)
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`flex-1 h-full min-h-[142px] px-3 border border-dashed rounded-lg flex flex-col items-center justify-center w-full cursor-pointer transition-all
        ${isDragging ? "bg-[#D8D7FF] border-[#6C63FF]" : "bg-[#E7E6FF66] border-[#A9A9DB] hover:bg-[#E7E6FF99]"}`}
    >
      <Image
        alt="upload"
        src="/assets/upload.svg"
        width={40}
        height={40}
        className="mb-2 pointer-events-none"
      />
      <p className="text-text-black text-sm font-medium text-center">
        {label}
      </p>
      <p className="text-text-gray text-xs text-center">{subLabel}</p>

      <input
        type="file"
        multiple
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        value=''
      />
    </div>
  );
}
