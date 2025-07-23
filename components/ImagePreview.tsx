"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  file?: File | null | string;
  documentName?: string;
}

export default function ImagePreview({
  open,
  onClose,
  file,
  documentName,
}: FilePreviewModalProps) {
  //   const getFileType = (file: File | null) => {
  //     if (!file) return "";
  //     return file.type.startsWith("image/")
  //       ? "image"
  //       : file.type === "application/pdf"
  //       ? "pdf"
  //       : "other";
  //   };

  //   const fileType = getFileType(file);
  console.log("open", open);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-xl max-w-md">
        <DialogHeader className="h-[20px]">
          <DialogTitle className="flex justify-start items-center gap-x-50">
            <span>Preview</span>
            <span className="text-sm font-normal text-gray-500 truncate max-w-[150]">
              {documentName || "Uploaded Document"}
            </span>
          </DialogTitle>
        </DialogHeader>

        {open && (
          <div className="flex justify-center  items-center h-[300px]">
            <img
              src={file}
              alt="Preview"
              className="max-h-60 object-contain rounded "
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
