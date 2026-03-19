"use client";

import FileDrag from "@/components/FileDrag";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
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

// import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, UploadCloud, UserIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { userRound } from "@/assets";
import PatientFormDialog from "@/components/CreateEdit";
import LoadingOverlay from "@/components/LoadingOverlay";
import InputComponent from "./InputComponent";
import SelectComponent from "./SelectComponent";
import Link from "next/link";
import { getUsersDropdown } from "@/services/users";

export default function CreateClaim({
  handleCreateClaim,
  loading,
  setLoading,
  claimInputs,
  setClaimInputs,
  isEditMode = false,
}) {
  // const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // const [claimInputs, setClaimInputs] = useState({
  //   isPreAuth: false,
  //   patientId: "",
  //   doctorName: "",
  //   tpaName: "",
  //   insuranceCompany: "",
  //   // status: "",
  //   description: "",
  //   preAuth: "",
  //   OTHER: "",
  //   additionalNotes: "",
  //   PAST_INVESTIGATION: "",
  //   CURRENT_INVESTIGATION: "",
  //   CLINIC_PAPER: "",
  //   ICP: "",
  // });
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const handleSelectChange = (value: string | boolean, name: string) => {
    setClaimInputs((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    // Required always
    if (!claimInputs.patientId) newErrors.patientId = "Patient is required";
    if (!claimInputs.doctorName) newErrors.doctorName = "Doctor name is required";
    if (!claimInputs.tpaName) newErrors.tpaName = "TPA name is required";
    if (!claimInputs.insuranceCompany)
      newErrors.insuranceCompany = "Insurance company is required";

    // Conditional: PreAuth
    if (claimInputs.isPreAuth && !claimInputs.preAuth) {
      newErrors.preAuth = "Pre-Auth document is required";
    }

    // Collect documents (Swagger expects at least one for non-draft)
    const documents = [
      claimInputs.ICP,
      claimInputs.CLINIC_PAPER,
      claimInputs.PAST_INVESTIGATION,
      claimInputs.CURRENT_INVESTIGATION,
      ...(claimInputs.OTHER || []),
    ].filter(Boolean);

    if (
      claimInputs.status !== "DRAFT" &&
      documents.length === 0
    ) {
      newErrors.documents = "At least one document is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleFileChange = async (value, name, multiple) => {
    if (multiple) {
      const formData = new FormData();

      // Append all files as 'files[]'
      Array.from(value).forEach((file: any) => {
        formData.append("files", file);
      });

      formData.append("folder", "claims");

      try {
        setLoading(true);
        const res = await bulkUploadFiles(formData); // Single API call
        setLoading(false);

        const uploadedFiles = res?.data?.map((file) => ({
          fileName: file?.key,
          type: name,
          ...(name === "OTHER" && { remark: "custom remark" }),
        }));

        setClaimInputs((prev) => ({
          ...prev,
          [name]: uploadedFiles,
        }));
      } catch (error) {
        setLoading(false);
        console.error("Bulk upload failed:", error);
      }
    } else {
      const formData = new FormData();
      formData.append("file", value[0]);
      formData.append("folder", "claims");

      try {
        setLoading(true);
        const res = await uploadFiles(formData);
        setLoading(false);
        setClaimInputs((prev) => ({
          ...prev,
          [name]: {
            fileName: res?.data?.key,
            type: name,
            ...(name === "OTHER" && { remark: "custom remark" }),
          },
        }));
      } catch (error) {
        setLoading(false);
        console.error("Single upload failed:", error);
      }
    }
  };
  const fetchHospitalsDropdown = async () => {
    setLoading(true);
    try {
      const res = await getUsersDropdown("HOSPITAL");
      if (res?.status === 200) {
        setHospitals(res?.data);
      }
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalsDropdown();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler); // Cleanup if user keeps typing
    };
  }, [searchTerm]);

  const fetchPatients = async () => {
    setSearchLoading(true);
    try {
      const query: any = {
        // skip: (page - 1) * pageSize,
        // take: pageSize,
        // sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (debouncedSearchTerm) query.search = debouncedSearchTerm;

      const res = await getPatientsByDropdownParams(query);
      if (res?.status == 200) {
        setPatients(res.data);
        setSearchLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setSearchLoading(false);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, [
    // page, pageSize,
    debouncedSearchTerm,
  ]);

  // const filteredPatients = patients.filter((patient) =>
  //   patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const handleCreatePatient = () => {
  //   setSelectedPatient(null);
  //   setOpenPatientDialog(true);
  // };

  const handleCreatePatient = async (payload) => {
    // Create new patient
    const { name, age, fileName, url, hospitalId } = payload;
    const dataToSend = isUserAdminOrSuperAdmin
      ? { name, age, fileName, url, hospitalId }
      : { name, age, fileName, url };
    try {
      setLoading(true);
      const response = await createPatient(dataToSend);
      if (response.status == 201) {
        setLoading(false);
        fetchPatients();
        setClaimInputs((prev) => {
          return {
            ...prev,
            ["patientId"]: response?.data?.id,
          };
        });
      }
    } catch (error: any) {
      setLoading(false);
      console.error(
        "Error creating patient:",
        error.response?.data || error.message
      );
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
            onCheckedChange={(e) => handleSelectChange(e, "isPreAuth")}
            checked={claimInputs.isPreAuth}
          />
          <Label className="text-sm">Is Pre-Auth Done?</Label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-6xl mx-auto mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Patient */}
          <div className="flex flex-col">
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
                  />
                </div>
                <button
                  onClick={() => setOpenPatientDialog(true)}
                  className="flex items-center w-full hover:bg-gray-100 rounded p-2"
                >
                  <Plus size={16} className="mr-2 text-[#3E79D6]" />
                  Add New Patient
                </button>
                {searchLoading
                  ? "Loading..."
                  : patients?.length
                    ? patients.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                      >
                        <Image
                          src={userRound}
                          alt="User Icon"
                          width={20}
                          height={20}
                        />
                        {item.name}
                      </SelectItem>
                    ))
                    : "No Patients"}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-red-500 text-xs mt-1">{errors.patientId}</p>
            )}
          </div>

          {/* Doctor */}
          <div className="flex flex-col">
            <InputComponent
              placeHolder="Dr. Name"
              Icon={UserIcon}
              value={claimInputs.doctorName}
              onChange={(e) =>
                handleSelectChange(e.target.value, "doctorName")
              }
            />
            {errors.doctorName && (
              <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>
            )}
          </div>

          {/* TPA */}
          <div className="flex flex-col">
            <SelectComponent
              value={claimInputs.tpaName}
              onValueChange={(value) => handleSelectChange(value, "tpaName")}
              selectOption={TPA_OPTIONS}
              Icon={UserIcon}
              label="TPA Name"
            />
            {errors.tpaName && (
              <p className="text-red-500 text-xs mt-1">{errors.tpaName}</p>
            )}
          </div>

          {/* Insurance */}
          <div className="flex flex-col">
            <SelectComponent
              value={claimInputs.insuranceCompany}
              onValueChange={(value) =>
                handleSelectChange(value, "insuranceCompany")
              }
              selectOption={INSURANCE_COMPANIES}
              Icon={UserIcon}
              label="Insurance Company"
            />
            {errors.insuranceCompany && (
              <p className="text-red-500 text-xs mt-1">
                {errors.insuranceCompany}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="my-4">
          <textarea
            value={claimInputs.description}
            onChange={(e) =>
              handleSelectChange(e.target.value, "description")
            }
            placeholder="Description"
            className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] w-full"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description}
            </p>
          )}
        </div>

        <PatientFormDialog
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          onSubmit={handleCreatePatient}
          defaultData={selectedPatient}
          isEditMode={!!selectedPatient}
          hospitals={hospitals} 
        />

        {/* Uploads */}
        {claimInputs?.isPreAuth && (
          <FileDrag
            title="Pre Auth"
            multiple={false}
            onChange={handleFileChange}
            name="preAuth"
          />
        )}
        <FileDrag
          title={"ICP "}
          multiple={false}
          onChange={handleFileChange}
          name={"ICP"}
          claimInputs={claimInputs?.ICP}
        />
        <FileDrag
          title={"Clinic Paper"}
          multiple={false}
          onChange={handleFileChange}
          name={"CLINIC_PAPER"}
        />
        <FileDrag
          title={"Past Investigation"}
          multiple={false}
          onChange={handleFileChange}
          name={"PAST_INVESTIGATION"}
          claimInputs={claimInputs?.PAST_INVESTIGATION}
        />
        <FileDrag
          title={"Current Investigation"}
          multiple={false}
          onChange={handleFileChange}
          name={"CURRENT_INVESTIGATION"}
        />
        <FileDrag
          title={"Misc Documents "}
          multiple={true}
          onChange={handleFileChange}
          name={"OTHER"}
          claimInputs={claimInputs?.OTHER}
        />
        {errors.preAuth && (
          <p className="text-red-500 text-xs mt-1">{errors.preAuth}</p>
        )}

        {errors.documents && (
          <p className="text-red-500 text-xs mt-1">{errors.documents}</p>
        )}


        {/* Notes */}
        <div className="mt-4">
          <textarea
            value={claimInputs.additionalNotes}
            onChange={(e) =>
              handleSelectChange(e.target.value, "additionalNotes")
            }
            placeholder="Additional Notes"
            className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] w-full"
          />
        </div>

        {/* ACTION BUTTONS — FULLY RESTORED */}
        <div className="mt-6 flex justify-end space-x-4 absolute bottom-5 right-20">
          <Link href="/claims">
            <Button variant="outline" className="text-[#3E79D6]">
              Cancel
            </Button>
          </Link>

          {/* Save as Draft */}
          {(!claimInputs.status || claimInputs.status === "") && (
            <Button
              disabled={loading}
              onClick={() => handleCreateClaim("DRAFT")}
              variant="outline"
              className="text-[#3E79D6]"
            >
              Save as Draft
            </Button>
          )}

          {/* Draft → Create */}
          {claimInputs.status === "DRAFT" ? (
            <>
              <Button
                disabled={loading}
                onClick={() => {
                  if (!validateFields()) return;
                  handleCreateClaim("SENT_TO_TPA");
                }}
                className="bg-[#3E79D6] px-4"
              >
                Create Claim
              </Button>

              <Button
                disabled={loading}
                onClick={() => handleCreateClaim("DRAFT")}
                className="bg-[#3E79D6] px-4"
              >
                Update Draft
              </Button>
            </>
          ) : (
            /* New Claim */
            <Button
              disabled={loading}
              onClick={() => {
                if (!validateFields()) return;
                handleCreateClaim("SENT_TO_TPA");
              }}
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
