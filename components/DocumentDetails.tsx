// import { documents } from "@/constants/menu";
import { getFileIconType } from "@/lib/utils";
import { Eye, Folder, Image } from "lucide-react";

export default function DocumentDetails({ data }) {
  return (
    <div className="grid grid-cols-6 gap-4 mt-6">
      {data?.documents?.map((doc, idx) => (
        <div
          key={idx}
          className="relative flex flex-col justify-between items-center border rounded-md p-4  bg-white shadow-sm"
        >
          {getFileIconType(doc?.fileName) == "image" ? (
            <Image className="h-18 w-18 text-blue-500" />
          ) : (
            <div className="h-12 mb-2" />
          )}
          <p className="text-sm text-gray-700">{doc.type}</p>
          <span>
            <Eye className="h-4 w-4 text-blue-500 absolute top-1 left-1" />
          </span>
        </div>
      ))}
    </div>
  );
}
