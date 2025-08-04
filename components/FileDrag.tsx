import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Folder, Image, X } from "lucide-react";
import ImagePreview from "./ImagePreview";

interface FileDropzoneProps {
  title: string;
  multiple?: boolean;
  onChange?: (files: File[], name?: string, multiple?: boolean) => void;
  name?: string;
  claimInputs?: any;
}

const FileDrag: React.FC<FileDropzoneProps> = ({
  title,
  multiple = false,
  onChange,
  name,
  claimInputs,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<{
    fileURL: File | null | string;
    file: string;
  }>({ fileURL: null, file: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const updatedFiles = multiple ? [...files, ...fileArray] : [fileArray[0]];
    setFiles(updatedFiles);
    onChange?.(updatedFiles, name, multiple);
  };
  useEffect(() => {
    if (!claimInputs) {
      return;
    }
    setFiles(claimInputs);
  }, [claimInputs]);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFileClick = (file) => {
    const fileURL = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      // Show image in modal
      setModalOpen(true);
      setImagePreview({ fileURL, file: file.name });
    } else if (file.type === "application/pdf") {
      // Open PDF in print view
      const newWindow = window.open(fileURL, "_blank");
      newWindow.onload = () => {
        newWindow.print();
      };
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
      file.type === "application/vnd.ms-excel" // .xls
    ) {
      // Open Excel files in a new tab
      window.open(fileURL, "_blank");
    } else {
      // Default fallback
      window.open(fileURL, "_blank");
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border rounded-md bg-blue-50 p-0 w-full max-w-full mb-3">
      {/* Header */}
      <div
        className={`w-full min-h-[50px] rounded-md p-4 flex items-center justify-center transition-all duration-200 cursor-pointer 
          ${
            isDragging
              ? "border-2 border-dashed border-blue-400 bg-blue-50"
              : "bg-[#F2F7FC] border border-gray-200"
          }`}
        onClick={() => inputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging ? (
          <div className="text-center text-blue-500">
            <UploadCloud className="w-6 h-6 mx-auto mb-1" />
            Drop file{multiple ? "s" : ""} here
          </div>
        ) : (
          <div className="flex justify-between items-center  w-full">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700">
              <Folder className="h-5 w-5 text-blue-500" />
              {title}
            </div>
            <button
              onClick={openFileDialog}
              className="text-sm text-blue-600 hover:underline flex items-center justify-between gap-1"
            >
              <UploadCloud className="h-4 w-4" />
              Upload
            </button>
            <input
              type="file"
              accept=".jpeg,.jpg,.png,.webp,.pdf"
              multiple={multiple}
              hidden
              ref={inputRef}
              onChange={handleInputChange}
            />
          </div>
        )}
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="p-4 flex gap-4 items-center flex-wrap">
          {files.map((file, index) => (
            <div key={index} className="text-center relative">
              <div
                onClick={() => handleFileClick(file)}
                className="border p-2 rounded"
              >
                {file.type.startsWith("image/") ? (
                  <Image className="h-10 w-10 text-blue-500 mx-auto" />
                ) : (
                  <Folder className="h-10 w-10 text-blue-400 mx-auto" />
                )}
              </div>
              <div className="text-xs mt-1 truncate max-w-[80px]">
                {file.name}
              </div>
              <span
                onClick={() => removeFile(index)}
                className="cursor-pointer text-sm absolute -top-2 -right-1 text-red-500"
              >
                X
              </span>
            </div>
          ))}
        </div>
      )}

      <ImagePreview
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        file={imagePreview.fileURL}
        documentName={imagePreview.file}
      />
    </div>
  );
};

export default FileDrag;
