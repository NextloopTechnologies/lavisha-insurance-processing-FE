import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { bulkDeleteFiles, bulkUploadFiles, uploadFiles } from "@/services/files";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileDrag from "./FileDrag";
import { createClaims, updateClaims } from "@/services/claims";
import { ParamValue } from "next/dist/server/request/params";
import LoadingOverlay from "./LoadingOverlay";
import { StatusType } from "@/types/claims";
import { toast } from "sonner";
interface CreateSettlementPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { name: string; age: number; image?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string };
  isEditMode?: boolean;
  selectedTab: string;
  data?: any;
  claimId: ParamValue;
  updateClaimStatusAfterModalSuccess?: (status: StatusType) => Promise<void>;
  setModalProcessingStatus?: (value: "") => void;
  fetchClaimsById: any;
}

export default function CreateDischargePopup({
  open,
  onOpenChange,
  onSubmit,
  defaultData,
  isEditMode = false,
  selectedTab,
  data,
  claimId,
  updateClaimStatusAfterModalSuccess,
  setModalProcessingStatus,
  fetchClaimsById
}: CreateSettlementPopupProps) {
  const [loading, setLoading] = useState(false);
  const [claimInputs, setClaimInputs] = useState<any>({
    isPreAuth: false,
    patientId: "",
    doctorName: "Dr. ",
    tpaName: "",
    insuranceCompany: "",
    status: StatusType.DISCHARGED,
    description: "",
    preAuth: "",
    OTHER: "",
    additionalNotes: "",
    PAST_INVESTIGATION: "",
    CURRENT_INVESTIGATION: "",
    CLINIC_PAPER: "",
    ICP: "",
    SETTLEMENT_LETTER: "",
    DISCHARGE_OTHER: [],
    dischargeSummary: "",
  });
  useEffect(() => {
    if (!data) return;

    const documentMap = data.documents.reduce((acc, doc) => {
      //  Handle both OTHER and DISCHARGE_OTHER as arrays
      if (doc.type === "OTHER" || doc.type === "DISCHARGE_OTHER") {
        acc[doc.type] = acc[doc.type] || [];
        acc[doc.type].push({
          id: doc.id,
          fileName: doc.fileName,
          type: doc.type,
          remark: doc.remark,
          url: doc.url,
        });
      } else {
        acc[doc.type] = {
          id: doc.id,
          fileName: doc.fileName,
          type: doc.type,
          url: doc.url,
        };
      }
      return acc;
    }, {});

    setClaimInputs({
      isPreAuth: data.isPreAuth,
      patientId: data.patientId,
      doctorName: data.doctorName,
      tpaName: data.tpaName,
      insuranceCompany: data.insuranceCompany,
      status: data.status,
      description: data.description,
      preAuth: "",
      additionalNotes: data.additionalNotes || "",
      OTHER: documentMap.OTHER || [],
      CLINIC_PAPER: documentMap.CLINIC_PAPER || "",
      ICP: documentMap.ICP || "",
      CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION || "",
      PAST_INVESTIGATION: documentMap.PAST_INVESTIGATION || "",
      SETTLEMENT_LETTER: documentMap.SETTLEMENT_LETTER || "",
      DISCHARGE_OTHER: documentMap.DISCHARGE_OTHER || [],
      dischargeSummary: data?.dischargeSummary,
    });
  }, [data]);
  const handleSelectChange = (value: string | boolean, name: string) => {
    setClaimInputs((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleFileChange = async (value, name, multiple) => {
    //  Add remove handler
    if (name === "remove") {
      try {
        setLoading(true);
        await bulkDeleteFiles([value.fileName]);
        if (value.type === "OTHER" || value.type === "DISCHARGE_OTHER") {
          setClaimInputs((prev) => ({
            ...prev,
            [value.type]: Array.isArray(prev[value.type])
              ? prev[value.type].filter((file) => {
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
      return;
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

        //  Append not replace
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
    }

    else {
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
            ...(name === "OTHER" && { remark: "custom remark" }),
          },
        }));
        toast.success("File uploaded successfully");
      } catch (error) {
        //  Use name not value.type
        setClaimInputs((prev) => ({
          ...prev,
          [name]: "",
        }));
        console.error("Single upload failed:", error);
        toast.error("Failed to upload file");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateClaim = async () => {
    try {
      const {
        CLINIC_PAPER,
        PAST_INVESTIGATION,
        CURRENT_INVESTIGATION,
        OTHER,
        ICP,
        preAuth,
        status,
        description,
        dischargeSummary,
        SETTLEMENT_LETTER,
        DISCHARGE_OTHER,
        ...others
      } = claimInputs;

      //  Pure function — never mutates state
      const cleanDoc = ({ url, file, ...rest }: any) => rest;

      const documents = [
        ...(Array.isArray(DISCHARGE_OTHER) ? DISCHARGE_OTHER.map(cleanDoc) : []),
        ...(Array.isArray(OTHER) ? OTHER.map(cleanDoc) : []),
      ].filter(Boolean);

      const payload = {
        ...others,
        dischargeSummary,
        status: StatusType.DISCHARGED,
        documents,
      };

      setLoading(true);
      const res = await updateClaims(payload, claimId);
      if (res?.status == 200) {
        await updateClaimStatusAfterModalSuccess(StatusType.DISCHARGED);
        onOpenChange(!open);
        fetchClaimsById();
        toast.success("Updated Claim with Discharge!");
      }
    } catch (error) {
      toast.error("Failed to update claim with discharge!");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setModalProcessingStatus?.("")
    onOpenChange(!open);
  };


  return (
    <>
      {loading && <LoadingOverlay />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-5xl max-w-md text-center p-8 rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Edit ${selectedTab}` : `Create ${selectedTab}`}
            </DialogTitle>
          </DialogHeader>
          <div className="realtive w-full">
            <div className="bg-white  w-full  mx-auto mt-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* <Input
                  placeholder="Doctor Name"
                  className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                  value={claimInputs.doctorName}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "doctorName")
                  }
                /> */}
              </div>

              {
                <div className="my-4">
                  <textarea
                    value={claimInputs.dischargeSummary}
                    onChange={(e) =>
                      handleSelectChange(e.target.value, "dischargeSummary")
                    }
                    placeholder="Description"
                    className="bg-[#F2F7FC] pl-2 text-sm font-semibold text-black  min-h-[100px] outline-blue-300  focus:outline-border w-full"
                  />
                </div>
              }

              {/* Upload Fields */}

              {/* <FileDrag
                title={"Settlement"}
                multiple={false}
                onChange={handleFileChange}
                name={"SETTLEMENT_LETTER"}
                //   claimInputs={claimInputs.SETTLEMENT_LETTER}
              /> */}


              <FileDrag
                title={
                  "Discharge Documents (Discharge Summary,Final Bill,OT notes in case of surgery)"
                }
                multiple={true}
                onChange={handleFileChange}
                name={"DISCHARGE_OTHER"}
                claimInputs={Array.isArray(claimInputs?.DISCHARGE_OTHER) ? claimInputs?.DISCHARGE_OTHER : []}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-4 absolute bottom-2 right-5">
                <Button
                  onClick={handleClose}
                  className="text-[#3E79D6]"
                  variant="outline"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleCreateClaim}
                  className="bg-[#3E79D6] px-4"
                >
                  {isEditMode ? `Edit ${selectedTab}` : `Create ${selectedTab}`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
