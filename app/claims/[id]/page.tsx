"use client";
import { useEffect, useState } from "react";
import { Tabs } from "@/components/Tabs";
import SidebarLayout from "@/components/SidebarLayout";
import PatientDetails from "@/components/PatientsDetails";
import DocumentDetails from "@/components/DocumentDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { getPatientById } from "@/services/patients";
import { MultiSelect } from "@/components/MultiSelect";
import { statusOptions } from "@/constants/menu";
import CreateFormPopup from "@/components/CreateFormPopup";
import { getClaims, getClaimsById } from "@/services/claims";

const tabLabels = [
  "Details",
  "Comments/History",
  "Enhancement",
  "Queried",
  "Discharge",
  "Settlement",
];

export default function PatientClaimDetails() {
  const [openPatientDialog, setOpenPatientDialog] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [patients, setPatients] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [claims, setClaims] = useState<any>([]);
  const [claimInputs, setClaimInputs] = useState({
    isPreAuth: false,
    patientId: "",
    doctorName: "",
    tpaName: "",
    insuranceCompany: "",
    // status: "",
    description: "",
    preAuth: "",
    OTHER: "",
    additionalNotes: "",
    PAST_INVESTIGATION: "",
    CURRENT_INVESTIGATION: "",
    CLINIC_PAPER: "",
    ICP: "",
  });
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  const params = useParams();
  const id = params.id;

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatientById(id);
      setPatients(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch patients:", err);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, [id]);

  console.log("claims", claims);
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await getClaimsById(id);
      console.log("res", res);
      setClaims(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch claims:", err);
    }
  };
  useEffect(() => {
    fetchClaims();
  }, []);
  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="flex justify-between gap-x-3 items-center mb-4">
          <div className="flex justify-start gap-x-3 items-center">
            <h2 className="text-xl font-semibold">{claims?.patient?.name}</h2>
            <span className="  px-3 py-1 rounded-md text-sm border">
              Claim Id:{" "}
              <a href="#" className="text-blue-600">
                {claims.refNumber}
              </a>
            </span>
          </div>

          <MultiSelect
            mode="single"
            selectedStatuses={selectedStatuses}
            status={statusOptions}
            toggleStatus={toggleStatus}
            setSelectedStatuses={setSelectedStatuses}
          />
        </div>

        <Tabs
          labels={tabLabels}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {activeTab === 0 && (
            <>
              <PatientDetails data={claims}/>
              <DocumentDetails data={claims}/>
            </>
          )}
          {activeTab === 1 && <p>Comments/History content</p>}
          {activeTab === 2 && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    className="rounded-sm bg-blue-500 px-3 py-2 text-white"
                  >
                    Create Enhancement
                  </button>
                </div>
                <PatientDetails />
                <DocumentDetails />
              </>
            </div>
          )}
          {activeTab === 3 && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    className="rounded-sm bg-blue-500 px-3 py-2 text-white"
                  >
                    Create Queried
                  </button>
                </div>
                <PatientDetails />
                <DocumentDetails />
              </>
            </div>
          )}

          {activeTab === 4 && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    className="rounded-sm bg-blue-500 px-3 py-2 text-white"
                  >
                    Create Discharge
                  </button>
                </div>
                <PatientDetails />
                <DocumentDetails />
              </>
            </div>
          )}
          {activeTab === 5 && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    className="rounded-sm bg-blue-500 px-3 py-2 text-white"
                  >
                    Create Settlement
                  </button>
                </div>
                <PatientDetails />
                <DocumentDetails />
              </>
            </div>
          )}

          {/* {activeTab === 4 && <p>Queried content</p>}

          {activeTab === 4 && <p>Queried content</p>} */}
        </div>
      </div>
      {activeTab === 2 && (
        <CreateFormPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          // claimInputs={}
          // isEditMode={!!selectedPatient}
          selectedTab={"Enhancement"}
        />
      )}
      {activeTab === 3 && (
        <CreateFormPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          // claimInputs={}
          // isEditMode={!!selectedPatient}
          selectedTab={"Queried"}
        />
      )}
    </SidebarLayout>
  );
}
