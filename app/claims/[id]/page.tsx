"use client";
import { useState } from "react";
// import { Tabs, TabPanel } from "./components/Tabs";
// import PatientDetails from "./components/PatientDetails";
// import DocumentGrid from "./components/DocumentGrid";
import { Tabs } from "@/components/Tabs";
import SidebarLayout from "@/components/SidebarLayout";
import PatientDetails from "@/components/PatientsDetails";
import DocumentDetails from "@/components/DocumentDetails";

const tabLabels = [
  "Details",
  "Comments/History",
  "Enhancement Flow",
  "Settlement",
];

export default function PatientClaimDetails() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Patient Name</h2>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm">
            Claim Id:{" "}
            <a href="#" className="underline">
              ID58673545
            </a>
          </span>
        </div>

        <Tabs
          labels={tabLabels}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {activeTab === 0 && (
            <>
              <PatientDetails />
              <DocumentDetails />
            </>
          )}
          {activeTab === 1 && <p>Comments/History content</p>}
          {activeTab === 2 && <p>Enhancement Flow content</p>}
          {activeTab === 3 && <p>Settlement content</p>}
        </div>
      </div>
    </SidebarLayout>
  );
}
