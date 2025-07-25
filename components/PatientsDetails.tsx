import { UserRound } from "lucide-react";

export default function PatientDetails() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {[
        ["Name", "Javed Khan"],
        ["Dr. Name", "Javed Khan"],
        ["TPA Name", "Javed Khan"],
        ["Insurance company", "Javed Khan insurance company"],
      ].map(([label, value], idx) => (
        <div key={idx} className="p-4 border rounded-md bg-white">
          <div className="flex gap-x-4">
            <span>
              <UserRound className="text-[#3E79D6]" />{" "}
            </span>
            <div>
              <div className="font-medium">{label}</div>
              <label className="text-xs text-gray-500">{value}</label>
            </div>
          </div>
        </div>
      ))}

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <label className="text-xs text-gray-500">Description</label>
        <p className="text-sm mt-1 text-gray-700">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry...
        </p>
      </div>

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <label className="text-xs text-gray-500">Additional Notes</label>
        <p className="text-sm mt-1 text-gray-700">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry...
        </p>
      </div>
    </div>
  );
}
