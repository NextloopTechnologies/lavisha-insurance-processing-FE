import { doctorBriefcase, editIcon, userRound } from "@/assets";
import Image from "next/image";

export default function PatientDetails({ data, show }) {
  const userData = [
    ...(show?.name
      ? [
          {
            key: "Name",
            value: data?.patient?.name,
          },
        ]
      : []),

    ...(show?.drName
      ? [
          {
            key: "Dr. Name",
            value: data?.doctorName,
          },
        ]
      : []),

    ...(show?.tpaName
      ? [
          {
            key: "TPA Name",
            value: data?.tpaName,
          },
        ]
      : []),

    ...(show?.tpaName
      ? [
          {
            key: "Insurance company",
            value: data?.insuranceCompany,
          },
        ]
      : []),
    ...(show?.noOfDays
      ? [
          {
            key: "Number of Days",
            value: 5,
          },
        ]
      : []),
  ];
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {userData.map(({ key, value }, idx) => (
        <div key={idx} className="p-4 border rounded-md bg-white">
          <div className="flex gap-x-4">
            <span className="mt-1">
              <Image
                src={key === "Dr. Name" ? doctorBriefcase : userRound}
                alt="User Icon"
                width={20}
                height={20}
              />
            </span>
            <div>
              <div className="font-medium">{key}</div>
              <label className="text-xs text-gray-500">{value}</label>
            </div>
          </div>
        </div>
      ))}

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <label className="text-xs text-gray-500">Description</label>
        <p className="text-sm mt-1 text-gray-700">{data?.description}</p>
      </div>

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <label className="text-xs text-gray-500">Additional Notes</label>
        <p className="text-sm mt-1 text-gray-700">{data?.additionalNotes}</p>
      </div>
    </div>
  );
}
