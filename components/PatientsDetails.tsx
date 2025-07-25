import { doctorBriefcase, editIcon, userRound } from "@/assets";
import Image from "next/image";

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
            <span className="mt-1">
              <Image src={label === "Dr. Name" ? doctorBriefcase : userRound} alt="User Icon" width={20} height={20} />
            </span>
            <div>
              <div className="font-medium">{label}</div>
              <label className="text-xs text-gray-500">{value}</label>
            </div>
          </div>
        </div>
      ))}

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <span>
          <Image src={editIcon} alt="Edit Icon" width={20} height={20} className="inline-block mr-2" />
          <label className="font-medium">Description</label>
        </span>
        <p className="text-sm mt-1 text-gray-700 ml-8">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry...
        </p>
      </div>

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <span>
          <Image src={editIcon} alt="Edit Icon" width={20} height={20} className="inline-block mr-2" />
          <label className="font-medium">Additional Notes</label>
        </span>
        <p className="text-sm mt-1 text-gray-700 ml-8">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry...
        </p>
      </div>
    </div>
  );
}
