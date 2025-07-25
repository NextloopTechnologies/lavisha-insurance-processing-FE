import { Eye, Folder, Image } from "lucide-react";

const documents = [
  { type: "Document Type 1", icon: true },
  { type: "Document Type 2", icon: true },
  { type: "Document Type 3", icon: false },
  { type: "Document Type 4", icon: false },
  { type: "Document Type 5", icon: false },
  { type: "Document Type 6", icon: false },
  { type: "Misc Document", icon: false },
  { type: "More Document", icon: false },
];

export default function DocumentDetails() {
  return (
    <div className="grid grid-cols-6 gap-4 mt-6">
      {documents.map((doc, idx) => (
        <div
          key={idx}
          className="relative flex flex-col justify-between items-center border rounded-md p-4  bg-white shadow-sm"
        >
          {doc.icon ? (
            // <img
            //   src="/placeholder-image.svg"
            //   alt="Preview"
            //   className="w-12 h-12 mx-auto mb-2"
            // />
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
