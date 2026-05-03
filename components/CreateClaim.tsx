"use client";

import FileDrag from "@/components/FileDrag";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INSURANCE_COMPANIES, TPA_OPTIONS } from "@/constants/menu";
import { createClaims } from "@/services/claims";
import { bulkUploadFiles, uploadFiles } from "@/services/files";
import {
  createPatient,
  getPatientById,
  getPatients,
  getPatientsByDropdownParams,
  getPatientsByParams,
} from "@/services/patients";
import { useRouter } from "next/navigation";
import { Plus, Search, UploadCloud, UserIcon, Building2, CalendarIcon } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { userRound } from "@/assets";
import PatientFormDialog from "@/components/CreateEdit";
import LoadingOverlay from "@/components/LoadingOverlay";
import InputComponent from "./InputComponent";
import SelectComponent from "./SelectComponent";
import Link from "next/link";
import { getUsersDropdown } from "@/services/users";
import { bulkDeleteFiles } from "@/services/files";
import CreateEditUser from "@/components/CreateEditUser";
import CreateUser from "@/components/CreateUser";
import { DatePicker2 } from "./DatePicker2";

export default function CreateClaim({
  handleCreateClaim,
  loading,
  setLoading,
  claimInputs,
  setClaimInputs,
  isEditMode = false,
  initialHospitalId = "",
}) {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [hospitalSearchLoading, setHospitalSearchLoading] = useState(false);
  const [debouncedHospitalSearchTerm, setDebouncedHospitalSearchTerm] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [openHospitalDialog, setOpenHospitalDialog] = useState(false);
  const [newHospitalUser, setNewHospitalUser] = useState(null);

  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const roles = Cookies.get("user_role")?.split(",") || [];
  const isUserAdminOrSuperAdmin = roles?.includes("ADMIN") || roles?.includes("SUPER_ADMIN");
  const isHospitalRole = roles?.includes("HOSPITAL") || roles?.includes("HOSPITAL_MANAGER");
  const loggedInUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") ?? "" : "";

  // ── 1 Sync hospitalId from initialHospitalId (edit mode) or role ──
  useEffect(() => {
    if (isHospitalRole && loggedInUserId) {
      setSelectedHospitalId(loggedInUserId);
    } else if (initialHospitalId) {
      setSelectedHospitalId(initialHospitalId);
    }
  }, [initialHospitalId]); // re-fires when API data arrives

  // ── 2 Auto-select first hospital in create mode (admin only) ──
  useEffect(() => {
    if (!isEditMode && isUserAdminOrSuperAdmin && hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospitalId(hospitals[0]?.id);
    }
  }, [hospitals]);

  // ── 3 Fetch patients when search or hospital changes ──
  useEffect(() => {
    if (isEditMode && initialHospitalId && !selectedHospitalId) return; // wait for hospitalId in edit mode
      if (!debouncedSearchTerm && !selectedHospitalId) return; // ← add this line

    fetchPatients();
  }, [debouncedSearchTerm, selectedHospitalId]);

  // ── 4 Fetch single patient by id (edit mode) ──
  useEffect(() => {
    fetchPatientsById();
  }, [claimInputs.patientId]);

  // ── Debounce patient search ──
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ── Debounce hospital search ──
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedHospitalSearchTerm(hospitalSearch), 500);
    return () => clearTimeout(handler);
  }, [hospitalSearch]);

  // ── Fetch hospitals (on search change) ──
  useEffect(() => {
    fetchHospitalsDropdown();
  }, [debouncedHospitalSearchTerm]);

  const handleSelectChange = (value: string | boolean, name: string) => {
    setClaimInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleHospitalChange = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    setClaimInputs((prev) => ({ ...prev, patientId: "" }));
  };

  const fetchHospitalsDropdown = async () => {
    setHospitalSearchLoading(true);
    try {
      const res = await getUsersDropdown("HOSPITAL", debouncedHospitalSearchTerm);
      if (res?.status === 200) setHospitals(res?.data);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
    } finally {
      setHospitalSearchLoading(false);
    }
  };

  const fetchPatients = async () => {
    setSearchLoading(true);
    try {
      const query: any = { sortOrder: "desc" };
      if (debouncedSearchTerm) query.search = debouncedSearchTerm;
      if (selectedHospitalId) query.hospitalId = selectedHospitalId;
      const res = await getPatientsByDropdownParams(query);
      if (res?.status == 200) setPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchPatientsById = async () => {
    try {
      if (claimInputs.patientId && !patients.some(p => p.id === claimInputs.patientId)) {
        const res = await getPatientById(claimInputs.patientId);
        if (res?.status == 200) {
          setPatients((prev) =>
            prev.some(p => p.id === res.data.id) ? prev : [...prev, res.data]
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch patient by id:", err);
    }
  };

  const handleCreatePatient = async (payload) => {
    const { name, age, fileName, url, hospitalId } = payload;
    const dataToSend = isUserAdminOrSuperAdmin
      ? { name, age, fileName, url, hospitalId }
      : { name, age, fileName, url };
    try {
      setLoading(true);
      const response = await createPatient(dataToSend);
      if (response.status == 201) {
        fetchPatients();
        setClaimInputs((prev) => ({ ...prev, patientId: response?.data?.id }));
      }
    } catch (error: any) {
      console.error("Error creating patient:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (value, name, multiple) => {
    if (name == "remove") {
      try {
        setLoading(true);
        await bulkDeleteFiles([value.fileName]);
        if (value.type == "OTHER") {
          setClaimInputs((prev) => ({
            ...prev,
            OTHER: Array.isArray(prev.OTHER)
              ? prev.OTHER.filter((file) => {
                  if (value.id && file.id) return file.id !== value.id;
                  return file.fileName !== value.fileName;
                })
              : [],
          }));
        } else {
          setClaimInputs((prev) => ({ ...prev, [value.type]: "" }));
        }
        toast.success("File removed successfully");
      } catch (error) {
        console.error("Bulk delete failed:", error);
        toast.error("Failed to remove file");
      } finally {
        setLoading(false);
      }
    } else if (multiple) {
      const formData = new FormData();
      Array.from(value).forEach((file: any) => formData.append("files", file));
      formData.append("folder", "claims");
      try {
        setLoading(true);
        const res = await bulkUploadFiles(formData);
        const uploadedFiles = res?.data?.map((file) => ({
          fileName: file?.key,
          type: name,
          isNew: true,
          ...(name === "OTHER" && { remark: "custom remark" }),
        }));
        setClaimInputs((prev) => ({
          ...prev,
          [name]: [...(Array.isArray(prev[name]) ? prev[name] : []), ...uploadedFiles],
        }));
        toast.success("Files uploaded successfully");
      } catch (error) {
        setClaimInputs((prev) => ({
          ...prev,
          [name]: Array.isArray(prev[name]) ? prev[name] : [],
        }));
        console.error("Bulk upload failed:", error);
        toast.error("Failed to upload files");
      } finally {
        setLoading(false);
      }
    } else {
      const formData = new FormData();
      formData.append("file", value[0]);
      formData.append("folder", "claims");
      try {
        setLoading(true);
        const res = await uploadFiles(formData);
        const existingDocument = claimInputs?.[name];
        const existingDocumentId = existingDocument ? existingDocument.id : null;
        setClaimInputs((prev) => ({
          ...prev,
          [name]: {
            ...(isEditMode && existingDocumentId ? { id: existingDocumentId } : {}),
            fileName: res?.data?.key,
            type: name,
            file: value[0],
            isNew: true,
            ...(name === "OTHER" && { remark: "custom remark" }),
          },
        }));
        toast.success("File uploaded successfully");
      } catch (error) {
        setClaimInputs((prev) => ({ ...prev, [name]: "" }));
        console.error("Single upload failed:", error);
        toast.error("Failed to upload file");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="realtive h-[calc(100vh-80px)] bg-gray-100 overflow-y-scroll">
      <div className="flex justify-start gap-x-10 items-center mt-2 pl-16">
        <h2 className="text-lg font-semibold">
          {isEditMode ? "Edit Claim" : "Add New Claim"}
        </h2>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-sm shadow-sm">
          <Checkbox
            id="isPreAuth"
            className=""
            onCheckedChange={(e) => handleSelectChange(e, "isPreAuth")}
            checked={claimInputs.isPreAuth}
          />
          <Label htmlFor="proauth" className="text-sm">
            Is Pre-Auth Done?
          </Label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-6xl mx-auto mt-4">

        {isUserAdminOrSuperAdmin ? (
          <>
            {/* Row 1: Hospital + Patient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedHospitalId} onValueChange={handleHospitalChange}>
                <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black">
                  <div className="flex gap-x-2 items-center">
                    <Building2 className="w-4 h-4 text-[#3E79D6]" />
                    <SelectValue placeholder="Select Hospital" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-2 pb-2 border-b">
                    <Search size={16} className="mr-2 text-[#3E79D6]" />
                    <Input
                      placeholder="Search hospital..."
                      className="h-8 border-none focus-visible:ring-0 shadow-none"
                      value={hospitalSearch}
                      onChange={(e) => setHospitalSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    onClick={() => setOpenHospitalDialog(true)}
                    className="flex items-center w-full hover:bg-gray-100 rounded p-2 text-sm"
                  >
                    <Plus size={16} className="mr-2 text-[#3E79D6]" />
                    Add New Hospital
                  </button>
                  {selectedHospitalId && (
                    <button
                      onClick={() => {
                        setSelectedHospitalId("");
                        setClaimInputs((prev) => ({ ...prev, patientId: "" }));
                      }}
                      className="flex items-center w-full hover:bg-gray-100 rounded p-2 text-sm text-gray-500"
                    >
                      Clear hospital filter
                    </button>
                  )}
                  {hospitalSearchLoading ? (
                    <div className="text-sm text-gray-400 px-2 py-1">Loading...</div>
                  ) : hospitals.length ? (
                    hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 px-2 py-1">No hospitals found</p>
                  )}
                </SelectContent>
              </Select>

              <Select
                value={claimInputs.patientId}
                onValueChange={(value) => handleSelectChange(value, "patientId")}
              >
                <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black">
                  <SelectValue placeholder="Patient Name" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-2 pb-2 border-b">
                    <Search size={16} className="mr-2 text-[#3E79D6]" />
                    <Input
                      placeholder="Search here..."
                      className="h-8 border-none focus-visible:ring-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    className="flex items-center w-full hover:bg-gray-100 rounded p-2"
                  >
                    <Plus size={16} className="mr-2 text-[#3E79D6]" />
                    Add New Patient
                  </button>
                  {searchLoading ? (
                    <p className="text-sm text-gray-400 px-2 py-1">Loading...</p>
                  ) : patients?.length ? (
                    patients.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="flex items-center">
                        <Image src={userRound} alt="User Icon" width={20} height={20} />
                        {`${item.name}  ${item.hospital?.name ?? ""}`}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 px-2 py-1">
                      {selectedHospitalId ? "No patients for this hospital" : "No Patients"}
                    </p>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Doctor + TPA + Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InputComponent
                placeHolder={"Dr. Name"}
                Icon={UserIcon}
                value={claimInputs.doctorName}
                onChange={(e) => handleSelectChange(e.target.value, "doctorName")}
              />
              <SelectComponent
                value={claimInputs.tpaName}
                onValueChange={(value) => handleSelectChange(value, "tpaName")}
                selectOption={TPA_OPTIONS}
                Icon={UserIcon}
                label={"TPA Name"}
                searchable
              />
              <SelectComponent
                value={claimInputs.insuranceCompany}
                onValueChange={(value) => handleSelectChange(value, "insuranceCompany")}
                selectOption={INSURANCE_COMPANIES}
                Icon={UserIcon}
                label={"Insurance Company"}
                searchable
              />
            </div>
          </>
        ) : (
          <>
            {/* Row 1: Patient + Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={claimInputs.patientId}
                onValueChange={(value) => handleSelectChange(value, "patientId")}
              >
                <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black">
                  <SelectValue placeholder="Patient Name" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-2 pb-2 border-b">
                    <Search size={16} className="mr-2 text-[#3E79D6]" />
                    <Input
                      placeholder="Search here..."
                      className="h-8 border-none focus-visible:ring-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    onClick={() => setOpenPatientDialog(true)}
                    className="flex items-center w-full hover:bg-gray-100 rounded p-2"
                  >
                    <Plus size={16} className="mr-2 text-[#3E79D6]" />
                    Add New Patient
                  </button>
                  {searchLoading ? (
                    <p className="text-sm text-gray-400 px-2 py-1">Loading...</p>
                  ) : patients?.length ? (
                    patients.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="flex items-center">
                        <Image src={userRound} alt="User Icon" width={20} height={20} />
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 px-2 py-1">No Patients</p>
                  )}
                </SelectContent>
              </Select>

              <InputComponent
                placeHolder={"Dr. Name"}
                Icon={UserIcon}
                value={claimInputs.doctorName}
                onChange={(e) => handleSelectChange(e.target.value, "doctorName")}
              />
            </div>

            {/* Row 2: TPA + Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <SelectComponent
                value={claimInputs.tpaName}
                onValueChange={(value) => handleSelectChange(value, "tpaName")}
                selectOption={TPA_OPTIONS}
                Icon={UserIcon}
                label={"TPA Name"}
                searchable
              />
              <SelectComponent
                value={claimInputs.insuranceCompany}
                onValueChange={(value) => handleSelectChange(value, "insuranceCompany")}
                selectOption={INSURANCE_COMPANIES}
                Icon={UserIcon}
                label={"Insurance Company"}
                searchable
              />
            </div>
          </>
        )}

        <div className="my-4">
          <textarea
            value={claimInputs.description}
            onChange={(e) => handleSelectChange(e.target.value, "description")}
            placeholder="Description"
            className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300 focus:outline-border w-full"
          />
        </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <div className="flex flex-col gap-1">
          {/* <Label className="text-xs text-gray-500 ml-1">Admission Date</Label> */}
                <div className="w-full">
                  <DatePicker2
                    date={claimInputs.dateOfAdmission ? new Date(claimInputs.dateOfAdmission) : undefined}
                    onChange={(date) => {
                      handleSelectChange(date ? date.toISOString() : "", "dateOfAdmission");
                      // Clear discharge if it's before new admission date
                      if (date && claimInputs.dateOfDischarge) {
                        const discharge = new Date(claimInputs.dateOfDischarge);
                        if (discharge < date) {
                          handleSelectChange("", "dateOfDischarge");
                        }
                      }
                    }}
                    disableFuture
                    placeholder="Admission Date"
                  />
                 </div>
                </div>
          
          <InputComponent
            placeHolder="Diagnosis"
            Icon={UserIcon}
            value={claimInputs.diagnosis}
            onChange={(e) => handleSelectChange(e.target.value, "diagnosis")}
          />
          <InputComponent
            placeHolder="Provisional Amount"
            Icon={UserIcon}
            value={claimInputs.provisionalAmount}
            onChange={(e) => handleSelectChange(e.target.value, "provisionalAmount")}
          />
        </div>

        <PatientFormDialog
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          onSubmit={handleCreatePatient}
          defaultData={selectedPatient}
          isEditMode={!!selectedPatient}
          hospitals={hospitals}
          preSelectedHospitalId={selectedHospitalId}
        />

        <CreateEditUser
          open={openHospitalDialog}
          onOpenChange={(isOpen) => {
            setOpenHospitalDialog(isOpen);
            if (!isOpen) setNewHospitalUser(null);
          }}
          isEditMode={false}
          title="Add Hospital"
        >
          <CreateUser
            userData={null}
            setUserData={setNewHospitalUser}
            setOpenDialog={setOpenHospitalDialog}
            fetchUsers={fetchHospitalsDropdown}
            defaultRole="HOSPITAL"
            disableRole={true}
            onSuccess={(createdUser) => {
              setSelectedHospitalId(createdUser.id);
              setOpenHospitalDialog(false);
              fetchHospitalsDropdown();
            }}
          />
        </CreateEditUser>

        {claimInputs?.isPreAuth && (
          <FileDrag title={"Pre Auth"} multiple={false} onChange={handleFileChange} name={"preAuth"} />
        )}
        <FileDrag
          title={"ICP "}
          multiple={false}
          onChange={handleFileChange}
          name={"ICP"}
          claimInputs={claimInputs?.ICP ? [claimInputs?.ICP] : []}
        />
        <FileDrag
          title={"Clinic Paper"}
          multiple={false}
          onChange={handleFileChange}
          name={"CLINIC_PAPER"}
          claimInputs={claimInputs?.CLINIC_PAPER ? [claimInputs?.CLINIC_PAPER] : []}
        />
        <FileDrag
          title={"Past Investigation"}
          multiple={false}
          onChange={handleFileChange}
          name={"PAST_INVESTIGATION"}
          claimInputs={claimInputs?.PAST_INVESTIGATION ? [claimInputs?.PAST_INVESTIGATION] : []}
        />
        <FileDrag
          title={"Current Investigation"}
          multiple={false}
          onChange={handleFileChange}
          name={"CURRENT_INVESTIGATION"}
          claimInputs={claimInputs?.CURRENT_INVESTIGATION ? [claimInputs?.CURRENT_INVESTIGATION] : []}
        />
        <FileDrag
          title={"Misc Documents "}
          multiple={true}
          onChange={handleFileChange}
          name={"OTHER"}
          claimInputs={claimInputs?.OTHER}
          onRemarkChange={(fileName, remark) => {
            setClaimInputs((prev) => ({
              ...prev,
              OTHER: Array.isArray(prev.OTHER)
                ? prev.OTHER.map((file) =>
                    file?.fileName === fileName || file?.name === fileName
                      ? { ...file, remark }
                      : file
                  )
                : prev.OTHER,
            }));
          }}
        />

        <div className="mt-4">
          <textarea
            value={claimInputs.additionalNotes}
            onChange={(e) => handleSelectChange(e.target.value, "additionalNotes")}
            placeholder="Additional Notes"
            className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300 focus:outline-border w-full"
          />
        </div>

        <div className="mt-6 flex justify-end space-x-4 absolute bottom-5 sm:right-20 right-5">
          <Link href="/claims">
            <Button className="text-[#3E79D6]" variant="outline">
              Cancel
            </Button>
          </Link>
          {claimInputs.status == "" && (
            <Button
              disabled={loading}
              onClick={() => handleCreateClaim("DRAFT")}
              variant="outline"
              className="text-[#3E79D6]"
            >
              Save as Draft
            </Button>
          )}
          {claimInputs.status === "DRAFT" ? (
            <>
              <Button
                disabled={loading}
                onClick={() => handleCreateClaim("PENDING")}
                className="bg-[#3E79D6] px-4"
              >
                Create Claim
              </Button>
              <Button
                disabled={loading}
                onClick={() => handleCreateClaim()}
                className="bg-[#3E79D6] px-4"
              >
                Update Draft
              </Button>
            </>
          ) : (
            <Button
              disabled={loading}
              onClick={() => handleCreateClaim(claimInputs.status)}
              className="bg-[#3E79D6] px-4"
            >
              {isEditMode ? "Update Claim" : "Create Claim"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
