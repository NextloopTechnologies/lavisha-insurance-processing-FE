// components/Tabs.js
export const Tabs = ({ labels, activeTab, onTabChange }) => (
  <div className="flex border-b">
    {labels.map((label, index) => (
      <button
        key={index}
        className={`py-2 px-6 text-sm font-medium ${
          activeTab === index
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-blue-500"
        }`}
        onClick={() => onTabChange(index)}
      >
        {label}
      </button>
    ))}
  </div>
);
