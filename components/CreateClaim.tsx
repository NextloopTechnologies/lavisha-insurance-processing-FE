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
import { bulkDeleteFiles, } from "@/services/files";
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
  const [hospitals, setHospitals] = useState([]);
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
  const roles = Cookies.get("user_role")?.split(",") || [];
  const isUserAdminOrSuperAdmin = roles?.includes("ADMIN") || roles?.includes("SUPER_ADMIN");
  const handleSelectChange = (value: string | boolean, name: string) => {
    setClaimInputs((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
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
          setClaimInputs((prev) => ({
            ...prev,
            [value.type]: "",
          }));
        }
        toast.success("File removed successfully");
      } catch (error) {
        console.error("Bulk delete failed:", error);
        toast.error("Failed to remove file");
      } finally {
        setLoading(false);
      }
    }

    else if (multiple) {
      const formData = new FormData();

      Array.from(value).forEach((file: any) => {
        formData.append("files", file);
      });

      formData.append("folder", "claims");

      try {
        setLoading(true);

        const res = await bulkUploadFiles(formData);

        const uploadedFiles = res?.data?.map((file) => ({
          fileName: file?.key,
          type: name,
          ...(name === "OTHER" && { remark: "custom remark" }),
        }));

        //  APPEND to existing array instead of replacing
        setClaimInputs((prev) => ({
          ...prev,
          [name]: [...(Array.isArray(prev[name]) ? prev[name] : []), ...uploadedFiles],
        }));

        toast.success("Files uploaded successfully");
      } catch (error) {
        //  Use `name`, not `value.type` (value is a FileList!)
        setClaimInputs((prev) => ({
          ...prev,
          [name]: Array.isArray(prev[name]) ? prev[name] : [],
        }));
        console.error("Bulk upload failed:", error);
        toast.error("Failed to upload files");

      } finally {
        setLoading(false);
      }
    }

    else {
      const formData = new FormData();
      formData.append("file", value[0]);
      formData.append("folder", "claims");

      try {
        setLoading(true);

        const res = await uploadFiles(formData);

        const existingDocument = claimInputs?.[name];
        const existingDocumentId = existingDocument
          ? existingDocument.id
          : null;

        setClaimInputs((prev) => ({
          ...prev,
          [name]: {
            ...(isEditMode && existingDocumentId
              ? { id: existingDocumentId }
              : {}),
            fileName: res?.data?.key,
            type: name,
            file: value[0],
            ...(name === "OTHER" && { remark: "custom remark" }),
          },
        }));

        toast.success("File uploaded successfully");
      } catch (error) {
        //  setClaimInputs((prev) => {
        //   const updatedInputs = { ...prev };
        //   updatedInputs[value.type] = "";
        //   return updatedInputs;
        // });
        setClaimInputs((prev) => ({
          ...prev,
          [name]: "",  // `name` is always correct e.g. "ICP", "CLINIC_PAPER" etc
        }));
        console.error("Single upload failed:", error);
        toast.error("Failed to upload file");
      } finally {
        setLoading(false);
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
  const fetchPatientsById = async () => {
    setSearchLoading(true);
    try {
      if (claimInputs.patientId && !patients.some(patient => patient.id === claimInputs.patientId)) {
        const res = await getPatientById(claimInputs.patientId);
        if (res?.status == 200) {
          setPatients((prevPatients) => {
            const patientExists = prevPatients.some(patient => patient.id === res.data.id);
            if (!patientExists) {
              return [...prevPatients, res.data];
            }
            return prevPatients;
          });
          setLoading(false);
        }

      }

    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch patients:", err);
    } finally {
      setSearchLoading(false);
    }
  };
  useEffect(() => {
    fetchPatientsById();
  }, [
    claimInputs,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            value={claimInputs.patientId}
            onValueChange={(value) => handleSelectChange(value, "patientId")}
          // disabled={!!claimInputs.patientId}
          >
            <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black ">
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
                      className="flex items-center"
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
              {/* <SelectItem value="Jane Smith">Jane Smith</SelectItem> */}
            </SelectContent>
          </Select>

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
          />

          <SelectComponent
            value={claimInputs.insuranceCompany}
            onValueChange={(value) =>
              handleSelectChange(value, "insuranceCompany")
            }
            selectOption={INSURANCE_COMPANIES}
            Icon={UserIcon}
            label={"Insurance Company"}
          />
        </div>

        <div className="my-4">
          <textarea
            value={claimInputs.description}
            onChange={(e) => handleSelectChange(e.target.value, "description")}
            placeholder="Description"
            className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300  focus:outline-border w-full"
          />
        </div>
        <PatientFormDialog
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          onSubmit={handleCreatePatient}
          defaultData={selectedPatient}
          isEditMode={!!selectedPatient}
          hospitals={hospitals}
        />

        {/* Upload Fields */}
        {claimInputs?.isPreAuth && (
          <FileDrag
            title={"Pre Auth"}
            multiple={false}
            onChange={handleFileChange}
            name={"preAuth"}
          />
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
        />

        <div className="mt-4">
          <textarea
            value={claimInputs.additionalNotes}
            onChange={(e) =>
              handleSelectChange(e.target.value, "additionalNotes")
            }
            placeholder="Additional Notes"
            className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300  focus:outline-border w-full"
          />
        </div>

        {/* Action Buttons */}
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
