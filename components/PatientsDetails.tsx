export default function PatientDetails() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {[
        ["Name", "Sanad Khan"],
        ["Dr. Name", "Sanad Khan"],
        ["TPA Name", "Sanad Khan"],
        ["Insurance company", "Sanad Khan insurance company"],
      ].map(([label, value], idx) => (
        <div key={idx} className="p-4 border rounded-md bg-white">
          <label className="text-xs text-gray-500">{label}</label>
          <div className="font-medium">{value}</div>
        </div>
      ))}

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <label className="text-xs text-gray-500">Description</label>
        <p className="text-sm mt-1 text-gray-700">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry...
        </p>
      </div>

      <div className="col-span-2 p-4 border rounded-md bg-white">
        <label className="text-xs text-gray-500">Additional Notes</label>
        <p className="text-sm mt-1 text-gray-700">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry...
        </p>
      </div>
    </div>
  );
}
