"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { generatePropertyDescriptionApiHandler, GeneratePropertyDescriptionResponse } from "@/services/postProperty";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Spinner from "../spinner";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function QuillEditor({ value = "", onChange }: QuillEditorProps) {
  const params = useParams();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillInstance.current) return;

    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      [{ align: [] }],
      ["clean"],
    ];

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
      },
    });

    // Set initial value
    quill.root.innerHTML = value || "";

    // Handle change
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChange?.(html);
    });

    quillInstance.current = quill;


    return () => {
      quill.off("text-change", () => {});
      // quillInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!quillInstance.current) return;
    const quill = quillInstance.current;
    if (value !== quill.root.innerHTML) {
      const selection = quill.getSelection();
      quill.root.innerHTML = value || "";
      if (selection) quill.setSelection(selection);
    }
  }, [value]);

  const { mutate: getDescription, isPending: loader } = useMutation({
    mutationFn: generatePropertyDescriptionApiHandler,
    onSuccess: (response: GeneratePropertyDescriptionResponse) => {
      onChange(response?.description)
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


  const getAiGeneratedDescription = () => {
    getDescription({propertyId: String(params?.propertyId ?? '')})
  }


  return (
    <div className="relative w-full">
      <div ref={editorRef} className=" bg-white min-h-[350px] pb-10 font-ibm-plex-sans!"></div>
      <div className="absolute bottom-[10px] right-[10px] flex justify-end">
          <button disabled={loader} type="button" onClick={getAiGeneratedDescription} className="min-w-[160px] flex justify-center rounded-full py-2 px-4 mt-2 text-sm border border-border cursor-pointer hover:bg-list-background">{loader ? <Spinner className="fill-black!"/> : 'Generate With AI'}</button>
        </div>
    </div>
  );
}
