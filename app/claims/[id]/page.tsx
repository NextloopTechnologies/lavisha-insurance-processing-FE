"use client";
import { useEffect, useMemo, useState } from "react";
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
import { getClaimsById, updateClaims } from "@/services/claims";
import Comments from "@/components/Comments";
import CreateSettlementPopup from "@/components/CreateSettlementPopup";
import { Pencil } from "lucide-react";
import CreateEnhancementPopup from "@/components/CreateEnhancementPopup";
import EnhancementDateDropdown from "@/components/EnhancementDateDropdown";
import CreateQueryPopup from "@/components/CreateQueryPopup";
import CreateDischargePopup from "@/components/CreateDischargePopup";
import { getStatusVisibility, statusMaxIndexMap } from "@/lib/utils";

const allTabLabels = [
  "Details",
  "Comments/History",
  "Queried",
  "Enhancement",
  "Discharge",
  "Settlement",
];

export default function PatientClaimDetails() {
  const [openPatientDialog, setOpenPatientDialog] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [patients, setPatients] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filteredStatusOptions, setFilteredStatusOptions] =
    useState(statusOptions);
  const [visibleTabLabels, setVisibleTabLabels] = useState<string[]>([]);
  const [claims, setClaims] = useState<any>([]);
  const [selectedEnhancementId, setSelectedEnhancementId] = useState("");
  const [selectedEnhancement, setSelectedEnhancement] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);

  console.log("selectedEnhancementId", selectedEnhancementId);
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

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await getClaimsById(id);
      if (res.status !== 200) throw new Error("Failed to get claims list!");

      setClaims(res.data);
      const currentStatus = res.data.status;
      setSelectedStatuses(currentStatus);
      setFilteredStatusOptions(getStatusVisibility(currentStatus));
      const maxIndex = statusMaxIndexMap[currentStatus];
      setVisibleTabLabels(allTabLabels.slice(0, maxIndex + 1));
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchEnhancement = async () => {
    setLoading(true);
    try {
      const res = await getClaimsById(id);
      setClaims(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch claims:", err);
    }
  };
  useEffect(() => {
    fetchClaims();
    fetchEnhancement();
  }, []);

  const filteredEnhancement = claims?.enhancements?.filter(
    (item) => item?.id == selectedEnhancementId
  )[0];

  const handleEditEnhancement = () => {
    setOpenPatientDialog(true);
    setSelectedEnhancement(filteredEnhancement);
  };
  // need memoization with MultiSelect in future performances
  const updateClaimStatus = async (status: string) => {
    try {
      setLoading(true);
      const res = await updateClaims({ status }, id);
      if (res.status !== 200) throw new Error("Failed to update status!");

      setSelectedStatuses([status]);
      setFilteredStatusOptions(getStatusVisibility(status));
      const maxIndex = statusMaxIndexMap[status];
      setVisibleTabLabels(allTabLabels.slice(0, maxIndex + 1));
      setClaims((prev: any) => ({ ...prev, status }));
    } catch (error) {
      console.error("catch eror", error);
    } finally {
      setLoading(false);
    }
  };

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
            status={filteredStatusOptions}
            toggleStatus={toggleStatus}
            setSelectedStatuses={setSelectedStatuses}
            updateClaimStatus={updateClaimStatus}
          />
        </div>

        <Tabs
          labels={visibleTabLabels}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {visibleTabLabels[activeTab] === "Details" && (
            <>
              <PatientDetails
                data={claims}
                show={{
                  drName: true,
                  name: true,
                  tpaName: true,
                  icName: true,
                  notes: true,
                }}
              />
              <DocumentDetails data={claims?.documents} type="all" />
            </>
          )}

          {visibleTabLabels[activeTab] === "Comments/History" && (
            <div>
              <Comments claimId={claims.id} />
            </div>
          )}

          {visibleTabLabels[activeTab] === "Queried" && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                  >
                    Create Queried
                  </button>
                </div>
                <PatientDetails />
                <DocumentDetails type={["ICP", "SETTLEMENT_LETTER", "OTHER"]} />
              </>
            </div>
          )}

          {visibleTabLabels[activeTab] === "Enhancement" && (
            <div>
              <>
                <div className="flex justify-between">
                  <div>
                    <EnhancementDateDropdown
                      enhancements={claims?.enhancements}
                      selectedId={selectedEnhancementId}
                      onChange={setSelectedEnhancementId}
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => handleEditEnhancement()}
                      // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                    >
                      <Pencil className="w-4 h-4 hover:text-blue-600 cursor-pointer mr-4" />
                    </button>
                    <button
                      onClick={() => setOpenPatientDialog(true)}
                      className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                    >
                      Create Another Enhancement
                      {/* <Pencil className="w-4 h-4 hover:text-blue-600 cursor-pointer" /> */}
                    </button>
                  </div>
                </div>
                <PatientDetails
                  data={filteredEnhancement}
                  show={{
                    drName: true,
                    name: false,
                    tpaName: false,
                    icName: false,
                    notes: true,
                    noOfDays: true,
                  }}
                />
                <DocumentDetails
                  data={filteredEnhancement?.documents}
                  type={["ICP", "OTHER"]}
                />
              </>
            </div>
          )}

          {visibleTabLabels[activeTab] === "Queried" && (
            <div>
              <>
                <div className="flex justify-between">
                  <div>
                    <EnhancementDateDropdown
                      enhancements={claims?.enhancements}
                      selectedId={selectedEnhancementId}
                      onChange={setSelectedEnhancementId}
                    />
                  </div>
                  <div className="flex justify-start items-center">
                    <button
                      onClick={() => handleEditEnhancement()}
                      // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                    >
                      <Pencil className="w-6 h-6 hover:text-blue-600 cursor-pointer mr-4" />
                    </button>
                    <button
                      onClick={() => setOpenPatientDialog(true)}
                      className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                    >
                      Create Query
                    </button>
                  </div>
                </div>
                <PatientDetails
                  data={filteredEnhancement}
                  show={{
                    drName: true,
                    name: false,
                    tpaName: false,
                    icName: false,
                    notes: true,
                    noOfDays: false,
                  }}
                />
                <DocumentDetails
                  data={filteredEnhancement?.documents}
                  type={["ICP", "OTHER"]}
                />
              </>
            </div>
          )}

          {visibleTabLabels[activeTab] === "Discharge" && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                  >
                    <Pencil className="w-6 h-6 hover:text-blue-600 cursor-pointer mr-2" />
                  </button>
                </div>
                <PatientDetails
                  data={claims}
                  show={{
                    drName: true,
                    name: false,
                    tpaName: false,
                    icName: false,
                    notes: false,
                  }}
                />
                <DocumentDetails
                  data={claims?.documents}
                  type={["ICP", "OTHER"]}
                />
              </>
            </div>
          )}
          {visibleTabLabels[activeTab] === "Settlement" && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                  >
                    <Pencil className="w-6 h-6 hover:text-blue-600 cursor-pointer mr-2" />
                  </button>
                </div>
                <PatientDetails
                  data={claims}
                  show={{
                    drName: true,
                    name: false,
                    tpaName: false,
                    icName: false,
                    notes: false,
                  }}
                />
                <DocumentDetails
                  data={claims?.documents}
                  type={["ICP", "SETTLEMENT_LETTER", "OTHER"]}
                />
              </>
            </div>
          )}
        </div>
      </div>
      {visibleTabLabels[activeTab] === "Enhancement" && (
        <CreateEnhancementPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          selectedEnhancement={selectedQuery}
          // claimInputs={}
          // isEditMode={!!selectedPatient}
          data={claims}
          claimId={claims.id}
          selectedTab={"Enhancement"}
        />
      )}

      {visibleTabLabels[activeTab] === "Queried" && (
        <CreateQueryPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          selectedQuery={selectedEnhancement}
          // claimInputs={}
          // isEditMode={!!selectedPatient}
          data={claims}
          claimId={claims.id}
          selectedTab={"Query"}
        />
      )}

      {visibleTabLabels[activeTab] === "Discharge" && (
        <CreateDischargePopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          // claimInputs={}
          isEditMode={true}
          data={claims}
          claimId={id}
          selectedTab={"Discharge"}
        />
      )}
      {visibleTabLabels[activeTab] === "Settlement" && (
        <CreateSettlementPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          // claimInputs={}
          // isEditMode={!!selectedPatient}
          data={claims}
          claimId={id}
          selectedTab={"Settlement"}
        />
      )}
    </SidebarLayout>
  );
}
