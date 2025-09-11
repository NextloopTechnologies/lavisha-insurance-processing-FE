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
import { useParams, useSearchParams } from "next/navigation";
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
import {
  filterTabsByData,
  getStatusVisibility,
  statusMaxIndexMap,
} from "@/lib/utils";
import { StatusType } from "@/types/claims";

const allTabLabels = [
  "Details",
  "Comments/History",
  "Queried",
  "Enhancement",
  "Discharge",
  "Settlement",
];

const statusToTabLabel: Record<string, string> = {
  SENT_TO_TPA: "Sent to TPA",
  DENIED: "Denied",
  APPROVED: "Approved",
  QUERIED: "Queried",
  ENHANCEMENT: "Enhancement",
  DISCHARGED: "Discharge",
  SETTLED: "Settlement",
};

const directUpdateStatus = [
  StatusType.SENT_TO_TPA,
  StatusType.DENIED,
  StatusType.APPROVED,
];
const modalDependentStatus = [
  StatusType.QUERIED,
  StatusType.ENHANCEMENT,
  StatusType.DISCHARGED,
  StatusType.SETTLED,
];

export default function PatientClaimDetails() {
  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [openParentLevelModal, setOpenParentLevelModal] = useState(false);

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
  const [modalProcessingStatus, setModalProcessingStatus] = useState<
    StatusType | ""
  >("");
  const [selectedQueryId, setQueryId] = useState("");

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
  const searchParams = useSearchParams();
  const statusFromQuery = searchParams.get("showStatus");
  const tabFromQuery = searchParams.get("tab");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatientById(id);
      if (res?.status == 200) {
        setPatients(res?.data);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch patients:", err);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, [id]);
  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(Number(tabFromQuery));
    }
  }, [tabFromQuery]);

  const fetchClaims = async (isFromUpdateClaim?: boolean) => {
    try {
      setLoading(true);
      const res = await getClaimsById(id);
      if (res?.status !== 200) throw new Error("Failed to get claims list!");
      setClaims({
        ...res?.data,
        enhancements: res?.data?.enhancements.sort(
          (a, b) =>
            new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime()
        ),
        queries: res?.data?.queries?.sort(
          (a, b) =>
            new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime()
        ),
      });

      const currentStatus = res?.data?.status;
      setSelectedStatuses(currentStatus);
      setFilteredStatusOptions(getStatusVisibility(currentStatus));
      const maxIndex = statusMaxIndexMap[currentStatus];
      let tabs = allTabLabels.slice(0, maxIndex + 1);
      tabs = filterTabsByData(tabs, res?.data);
      setVisibleTabLabels(tabs);
      // only if it is coming from update status modal
      if (isFromUpdateClaim) {
        const indexToSet = tabs.findIndex(
          (label) =>
            label.toLowerCase() ===
            statusToTabLabel[currentStatus].toLowerCase()
        );
        setActiveTab(indexToSet !== -1 ? indexToSet : 0);
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchClaimsById = async () => {
    setLoading(true);
    try {
      const res = await getClaimsById(id);
      if (res?.status == 200) {
        setClaims({
          ...res?.data,
          enhancements: res?.data?.enhancements.sort(
            (a, b) =>
              new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime()
          ),
          queries: res?.data?.queries?.sort(
            (a, b) =>
              new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime()
          ),
        });
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch claims:", err);
    }
  };
  useEffect(() => {
    fetchClaims();
    fetchClaimsById();
  }, []);

  const filteredEnhancement =
    claims?.enhancements?.filter(
      (item) => item?.raisedAt == selectedEnhancementId
    )?.[0] ?? [];
  useEffect(() => {
    if (claims?.enhancements?.length) {
      setSelectedEnhancementId(claims?.enhancements?.[0]?.raisedAt ?? null);
    }
  }, [claims]);

  const filteredQueries =
    claims?.queries?.filter((item) => item?.raisedAt == selectedQueryId)?.[0] ??
    [];
  useEffect(() => {
    if (claims?.queries?.length) {
      setQueryId(claims?.queries?.[0]?.raisedAt ?? null);
    }
  }, [claims]);

  const handleEditEnhancement = () => {
    setOpenPatientDialog(true);
    setSelectedEnhancement(filteredEnhancement);
  };

  const handleEditQuery = () => {
    setOpenPatientDialog(true);
    setSelectedQuery(filteredQueries);
  };
  // need memoization with MultiSelect in future performances
  const updateClaimStatus = async (status: StatusType) => {
    try {
      setLoading(true);

      if (directUpdateStatus.includes(status)) {
        const res = await updateClaims({ status }, id);
        if (res?.status !== 200) throw new Error("Failed to update status!");
        setSelectedStatuses([status]);
        setFilteredStatusOptions(getStatusVisibility(status));
        setClaims((prev: any) => ({ ...prev, status }));
      }

      if (modalDependentStatus.includes(status)) {
        setModalProcessingStatus(status);
        setOpenParentLevelModal(true);
      }
    } catch (error) {
      console.error("catch eror", error);
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatusAfterModalSuccess = async (status: StatusType) => {
    try {
      setLoading(true);
      if (modalDependentStatus.includes(status)) {
        if ([StatusType.QUERIED, StatusType.ENHANCEMENT].includes(status)) {
          const result = await updateClaims({ status }, id);
          if (result?.status !== 200)
            throw new Error("Failed to update status!");
        }
        // passing true to update the claim and set the current status as active tab
        fetchClaims(true);
      }
    } catch (error) {
      console.log("UPDATE_STATUS_AFTER_MODAL", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 h-[calc(100vh-80px)] overflow-y-scroll">
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
            isClaimDetailsSelect={true}
            disable={Boolean(statusFromQuery)}
          />
        </div>

        <Tabs
          labels={visibleTabLabels}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* open modal from parent for auto modal operations */}
        {modalProcessingStatus === StatusType.QUERIED &&
          openParentLevelModal && (
            <CreateQueryPopup
              open={openParentLevelModal}
              onOpenChange={setOpenParentLevelModal}
              setSelectedQuery={setSelectedQuery}
              selectedQuery={selectedQuery}
              data={claims}
              claimId={claims?.id}
              selectedTab={"Query"}
              fetchClaimsById={fetchClaimsById}
              updateClaimStatusAfterModalSuccess={
                updateClaimStatusAfterModalSuccess
              }
              setModalProcessingStatus={setModalProcessingStatus}
            />
          )}

        {modalProcessingStatus === StatusType.ENHANCEMENT &&
          openParentLevelModal && (
            <CreateEnhancementPopup
              open={openParentLevelModal}
              onOpenChange={setOpenParentLevelModal}
              setSelectedEnhancement={setSelectedEnhancement}
              selectedEnhancement={selectedEnhancement}
              data={claims}
              claimId={claims?.id}
              selectedTab={"Enhancement"}
              fetchClaimsById={fetchClaimsById}
              updateClaimStatusAfterModalSuccess={
                updateClaimStatusAfterModalSuccess
              }
              setModalProcessingStatus={setModalProcessingStatus}
            />
          )}

        {modalProcessingStatus === StatusType.DISCHARGED &&
          openParentLevelModal && (
            <CreateDischargePopup
              open={openParentLevelModal}
              onOpenChange={setOpenParentLevelModal}
              isEditMode={true}
              data={claims}
              claimId={id}
              selectedTab={"Discharge"}
              fetchClaimsById={fetchClaimsById}
              updateClaimStatusAfterModalSuccess={
                updateClaimStatusAfterModalSuccess
              }
              setModalProcessingStatus={setModalProcessingStatus}
            />
          )}

        {modalProcessingStatus === StatusType.SETTLED &&
          openParentLevelModal && (
            <CreateSettlementPopup
              open={openParentLevelModal}
              onOpenChange={setOpenParentLevelModal}
              data={claims}
              claimId={id}
              selectedTab={"Settlement"}
              fetchClaimsById={fetchClaimsById}
              updateClaimStatusAfterModalSuccess={
                updateClaimStatusAfterModalSuccess
              }
              setModalProcessingStatus={setModalProcessingStatus}
            />
          )}

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
                  additionalNotes: true,
                  description: true,
                }}
              />
              <DocumentDetails data={claims?.documents} type="all" />
            </>
          )}

          {visibleTabLabels[activeTab] === "Comments/History" && (
            <div>
              <Comments
                claimId={claims?.id}
                disable={Boolean(statusFromQuery)}
                data={claims}
              />
            </div>
          )}
          {visibleTabLabels[activeTab] === "Enhancement" && (
            <div>
              <>
                <div className="flex justify-between">
                  <div>
                    {claims?.enhancements?.length > 0 && (
                      <EnhancementDateDropdown
                        enhancements={claims?.enhancements}
                        selectedId={selectedEnhancementId}
                        onChange={setSelectedEnhancementId}
                      />
                    )}
                  </div>
                  <div>
                    {selectedEnhancementId && (
                      <button
                        disabled={Boolean(statusFromQuery)}
                        onClick={() => handleEditEnhancement()}
                        // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                      >
                        <Pencil
                          className={`w-6 h-6 ${
                            Boolean(statusFromQuery)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-[#3E79D6] cursor-pointer"
                          }   mr-2`}
                        />
                      </button>
                    )}
                    <button
                      disabled={Boolean(statusFromQuery)}
                      onClick={() => setOpenPatientDialog(true)}
                      className={`rounded-sm bg-[#3E79D6]  px-3 py-2 text-white ${
                        Boolean(statusFromQuery)
                          ? " cursor-not-allowed"
                          : " cursor-pointer"
                      }`}
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
                    additionalNotes: true,
                    description: true,
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
                    {claims?.queries?.length > 0 && (
                      <EnhancementDateDropdown
                        enhancements={claims?.queries}
                        selectedId={selectedQueryId}
                        onChange={setQueryId}
                      />
                    )}
                  </div>
                  <div className="flex justify-start items-center">
                    {selectedQueryId && (
                      <button
                        disabled={Boolean(statusFromQuery)}
                        onClick={() => handleEditQuery()}
                        // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                      >
                        <Pencil
                          className={`w-6 h-6 ${
                            Boolean(statusFromQuery)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-[#3E79D6] cursor-pointer"
                          }   mr-2`}
                        />
                      </button>
                    )}
                    <button
                      disabled={Boolean(statusFromQuery)}
                      onClick={() => setOpenPatientDialog(true)}
                      className={`rounded-sm bg-[#3E79D6]  px-3 py-2 text-white ${
                        Boolean(statusFromQuery)
                          ? " cursor-not-allowed"
                          : " cursor-pointer"
                      }`}
                    >
                      Create Query
                    </button>
                  </div>
                </div>
                <PatientDetails
                  data={filteredQueries}
                  show={{
                    drName: false,
                    name: false,
                    tpaName: false,
                    icName: false,
                    notes: true,
                    noOfDays: false,
                    additionalNotes: true,
                    description: true,
                  }}
                />
                <DocumentDetails
                  data={filteredQueries?.documents}
                  type={[
                    "ICP",
                    "OTHER",
                    "CURRENT_INVESTIGATION",
                    "EXCEL_REPORT",
                  ]}
                />
              </>
            </div>
          )}

          {visibleTabLabels[activeTab] === "Discharge" && (
            <div>
              <>
                <div className="flex justify-end">
                  <button
                    disabled={Boolean(statusFromQuery)}
                    onClick={() => setOpenPatientDialog(true)}
                    // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                  >
                    <Pencil
                      className={`w-6 h-6 ${
                        Boolean(statusFromQuery)
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-[#3E79D6] cursor-pointer"
                      }   mr-2`}
                    />
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
                    dischargeSummary: true,
                    additionalNotes: false,
                    description: false,
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
                    disabled={Boolean(statusFromQuery)}
                    onClick={() => setOpenPatientDialog(true)}
                    // className="rounded-sm bg-[#3E79D6] px-3 py-2 text-white"
                  >
                    <Pencil
                      className={`w-6 h-6 ${
                        Boolean(statusFromQuery)
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-[#3E79D6] cursor-pointer"
                      }   mr-2`}
                    />
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
                    additionalNotes: false,
                    description: false,
                    settlementSummary: true,
                    settlementAmount: true,
                    actualQuotedAmount: true,
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
      {visibleTabLabels[activeTab] === "Enhancement" && openPatientDialog && (
        <CreateEnhancementPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          setSelectedEnhancement={setSelectedEnhancement}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          selectedEnhancement={selectedEnhancement}
          // claimInputs={}
          isEditMode={!!selectedEnhancement}
          fetchClaimsById={fetchClaimsById}
          data={claims}
          claimId={claims.id}
          selectedTab={"Enhancement"}
          updateClaimStatusAfterModalSuccess={
            updateClaimStatusAfterModalSuccess
          }
        />
      )}

      {visibleTabLabels[activeTab] === "Queried" && openPatientDialog && (
        <CreateQueryPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          setSelectedQuery={setSelectedQuery}
          selectedQuery={selectedQuery}
          // claimInputs={}
          isEditMode={!!selectedQuery}
          data={claims}
          claimId={claims.id}
          selectedTab={"Query"}
          fetchClaimsById={fetchClaimsById}
          updateClaimStatusAfterModalSuccess={
            updateClaimStatusAfterModalSuccess
          }
        />
      )}

      {visibleTabLabels[activeTab] === "Discharge" && openPatientDialog && (
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
          fetchClaimsById={fetchClaimsById}
          updateClaimStatusAfterModalSuccess={
            updateClaimStatusAfterModalSuccess
          }
        />
      )}
      {visibleTabLabels[activeTab] === "Settlement" && openPatientDialog && (
        <CreateSettlementPopup
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          // onSubmit={handleSubmitPatient}
          // defaultData={selectedPatient}
          // claimInputs={}
          isEditMode={true}
          data={claims}
          claimId={id}
          selectedTab={"Settlement"}
          fetchClaimsById={fetchClaimsById}
          updateClaimStatusAfterModalSuccess={
            updateClaimStatusAfterModalSuccess
          }
        />
      )}
    </SidebarLayout>
  );
}
