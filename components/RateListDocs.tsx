// components/RateListDocs.tsx
"use client";

import { Folder } from "lucide-react";

export default function RateListDocs({
  hospital,
}: {
  hospital: any;
}) {
  const fileNames: string[] = hospital?.rateListFileNames ?? [];
  const fileUrls: string[] = hospital?.rateListUrls ?? [];

  if (!fileNames.length) return null;

  return (
    <div className="border rounded-md bg-blue-50 w-full max-w-full mt-4">
      {/* Header */}
      <div className="w-full min-h-[50px] rounded-t-md p-4 flex items-center bg-[#F2F7FC] border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Folder className="h-5 w-5 text-blue-500" />
          <span>Rate List Files</span>

          <span className="text-xs font-normal text-gray-400 ml-1">
            ({hospital?.name})
          </span>
        </div>
      </div>

      {/* Files grid */}
      <div className="p-4 flex gap-4 items-center flex-wrap">
        {fileNames.map((key, i) => (
          <div key={i} className="text-center">
            <a
              href={fileUrls[i]}
              target="_blank"
              rel="noopener noreferrer"
              title={key.split("/").pop()}
              className="block"
            >
              <div className="border p-2 rounded hover:bg-blue-100 transition">
                <Folder className="h-10 w-10 text-blue-400 mx-auto" />
              </div>

              <div
                className="text-xs mt-1 truncate max-w-[80px]"
                title={key.split("/").pop()}
              >
                {key.split("/").pop()}
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}