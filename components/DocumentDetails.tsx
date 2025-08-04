// import { documents } from "@/constants/menu";
import { getFileIconType } from "@/lib/utils";
import { Eye, Image } from "lucide-react";
import ImagePreview from "./ImagePreview";
import { useState } from "react";

export default function DocumentDetails({ data, type }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{
    fileURL: File | null | string;
    file: string;
  }>({ fileURL: null, file: "" });
  const filteredDocs = data?.filter((doc) => {
    if (type === "all") return true;
    if (Array.isArray(type)) return type.includes(doc.type);
    return doc.type === type;
  });
  return (
    <div className="grid grid-cols-6 gap-4 mt-6">
      {filteredDocs?.map((doc, idx) => (
        <div
          key={idx}
          className="relative flex flex-col justify-between items-center border rounded-md p-4  bg-white shadow-sm"
        >
          {getFileIconType(doc?.fileName) == "image" ? (
            <Image
              onClick={() => {
                setModalOpen(true);
                setImagePreview({ fileURL: doc?.url, file: doc?.fileName });
              }}
              className="h-18 w-18 text-blue-500"
            />
          ) : (
            <div className="h-12 mb-2" />
          )}
          <p className="text-sm text-gray-700">{doc.type}</p>
          <span>
            <Eye className="h-4 w-4 text-blue-500 absolute top-1 left-1" />
          </span>
        </div>
      ))}
      <ImagePreview
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        file={imagePreview.fileURL}
        documentName={imagePreview.file}
      />
    </div>
  );
}
