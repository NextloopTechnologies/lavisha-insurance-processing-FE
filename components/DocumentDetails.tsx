const documents = [
  { type: "Document Type 1", icon: true },
  { type: "Document Type 2", icon: true },
  { type: "Document Type 3", icon: false },
  { type: "Document Type 4", icon: false },
  { type: "Misc Document", icon: false },
  { type: "More Document", icon: false },
];

export default function DocumentDetails() {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {documents.map((doc, idx) => (
        <div
          key={idx}
          className="border rounded-md p-4 text-center bg-white shadow-sm"
        >
          {doc.icon ? (
            <img
              src="/placeholder-image.svg"
              alt="Preview"
              className="w-12 h-12 mx-auto mb-2"
            />
          ) : (
            <div className="h-12 mb-2" />
          )}
          <p className="text-sm text-gray-700">{doc.type}</p>
        </div>
      ))}
    </div>
  );
}
