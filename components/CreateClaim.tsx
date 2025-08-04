"use client";

import FileDrag from "@/components/FileDrag";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getPatientById, getPatients } from "@/services/patients";
import { useRouter } from "next/navigation";

// import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, UploadCloud } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { userRound } from "@/assets";
import PatientFormDialog from "@/components/CreateEdit";
import LoadingOverlay from "@/components/LoadingOverlay";

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
  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
    setClaimInputs((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
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
        const res = await bulkUploadFiles(formData); // Single API call

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
        console.error("Bulk upload failed:", error);
      }
    } else {
      const formData = new FormData();
      formData.append("file", value[0]);
      formData.append("folder", "claims");

      try {
        const res = await uploadFiles(formData);
        setClaimInputs((prev) => ({
          ...prev,
          [name]: {
            fileName: res?.data?.key,
            type: name,
            ...(name === "OTHER" && { remark: "custom remark" }),
          },
        }));
      } catch (error) {
        console.error("Single upload failed:", error);
      }
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data.data);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch patients:", err);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setOpenPatientDialog(true);
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
                onClick={handleCreatePatient}
                className="flex items-center w-full hover:bg-gray-100 rounded p-2"
              >
                <Plus size={16} className="mr-2 text-[#3E79D6]" />
                Add New Patient
              </button>
              {filteredPatients.map((item) => (
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
              ))}
              {/* <SelectItem value="Jane Smith">Jane Smith</SelectItem> */}
            </SelectContent>
          </Select>

          <Input
            placeholder="Doctor Name"
            className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
            value={claimInputs.doctorName}
            onChange={(e) => handleSelectChange(e.target.value, "doctorName")}
          />

          <Select
            value={claimInputs.tpaName}
            onValueChange={(value) => handleSelectChange(value, "tpaName")}
          >
            <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black">
              <SelectValue placeholder="TPA Name" />
            </SelectTrigger>
            <SelectContent>
              {TPA_OPTIONS.map((tpa) => (
                <SelectItem key={tpa} value={tpa}>
                  {tpa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={claimInputs.insuranceCompany}
            onValueChange={(value) =>
              handleSelectChange(value, "insuranceCompany")
            }
          >
            <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black">
              <SelectValue placeholder="Insurance Company" />
            </SelectTrigger>
            <SelectContent>
              {INSURANCE_COMPANIES.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="mt-6 flex justify-end space-x-4 absolute bottom-5 right-20">
          <Button className="text-[#3E79D6]" variant="outline">
            Cancel
          </Button>
          {claimInputs.status == "DRAFT" ? (
            ""
          ) : (
            <Button variant="outline" className="text-[#3E79D6]">
              Save as Draft
            </Button>
          )}
          <Button onClick={handleCreateClaim} className="bg-[#3E79D6] px-4">
            {isEditMode ? "Update Claim" : "Create Claim"}
          </Button>
        </div>
      </div>
    </div>
  );
}
