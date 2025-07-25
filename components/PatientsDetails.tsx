import { UserRound } from "lucide-react";

export default function PatientDetails({ data }) {
  const userData = [
    {
      key: "Name",
      value: data?.patient?.name,
    },
    {
      key: "Dr. Name",
      value: data?.doctorName,
    },
    {
      key: "TPA Name",
      value: data?.tpaName,
    },
    {
      key: "Insurance company",
      value: data?.insuranceCompany,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {userData.map(({ key, value }, idx) => (
        <div key={idx} className="p-4 border rounded-md bg-white">
          <div className="flex gap-x-4">
            <span>
              <UserRound className="text-[#3E79D6]" />{" "}
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
        <p className="text-sm mt-1 text-gray-700">
          {data?.description}
        </p>
      </div>

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <label className="text-xs text-gray-500">Additional Notes</label>
        <p className="text-sm mt-1 text-gray-700">
          {data?.additionalNotes}
        </p>
      </div>
    </div>
  );
}
