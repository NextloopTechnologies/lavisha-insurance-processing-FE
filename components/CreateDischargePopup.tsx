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
import { bulkUploadFiles, uploadFiles } from "@/services/files";
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
interface CreateSettlementPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { name: string; age: number; image?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string };
  isEditMode?: boolean;
  selectedTab: string;
  data?: any;
  claimId: ParamValue;
  updateClaimStatusAfterModalSuccess?: (status: string) => Promise<void>;
  onClose?: () => void;
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
  onClose,
  fetchClaimsById,
}: CreateSettlementPopupProps) {
  const [loading, setLoading] = useState(false);
  const [claimInputs, setClaimInputs] = useState<any>({
    isPreAuth: false,
    patientId: "",
    doctorName: "Dr. ",
    tpaName: "",
    insuranceCompany: "",
    status: "DICHARGED",
    description: "",
    preAuth: "",
    OTHER: "",
    additionalNotes: "",
    PAST_INVESTIGATION: "",
    CURRENT_INVESTIGATION: "",
    CLINIC_PAPER: "",
    ICP: "",
    SETTLEMENT_LETTER: "",
    dischargeSummary: "",
  });

  useEffect(() => {
    if (!data) return;

    // Map documents by their type
    const documentMap = data.documents.reduce((acc, doc) => {
      if (doc.type === "OTHER") {
        acc[doc.type] = acc[doc.type] || [];
        acc[doc.type].push({
          id: doc.id,
          fileName: doc.fileName,
          type: doc.type,
          remark: doc.remark,
        });
      } else {
        acc[doc.type] = {
          id: doc.id,
          fileName: doc.fileName,
          type: doc.type,
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
      preAuth: "", // You can derive if needed
      additionalNotes: data.additionalNotes || "",
      OTHER: documentMap.OTHER || [],
      CLINIC_PAPER: documentMap.CLINIC_PAPER || "",
      ICP: documentMap.ICP || "",
      CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION || "",
      PAST_INVESTIGATION: documentMap.PAST_INVESTIGATION || "",
      SETTLEMENT_LETTER: documentMap.SETTLEMENT_LETTER || "",
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
        ...others
      } = claimInputs;
      const payload = {
        ...others,
        dischargeSummary,

        documents: [
          //   CLINIC_PAPER,
          //   ICP,
          //   PAST_INVESTIGATION,
          //   CURRENT_INVESTIGATION,
          //   SETTLEMENT_LETTER,
          ...(OTHER || []), // if OTHER is an array, ensure it's not null
        ].filter(Boolean),
      };
      setLoading(true);
      const res = await updateClaims(payload, claimId);
      if (res.status == 200) {
        await updateClaimStatusAfterModalSuccess("DISCHARGED");
        setLoading(false);
        onOpenChange(!open);
        fetchClaimsById();
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      // setLoading(false);
    }
  };
  const handleClose = () => {
    onClose?.()
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
                  "Miscellaneous Documents (Discharge Summary,Final Bill,OT notes in case of surgery)"
                }
                multiple={true}
                onChange={handleFileChange}
                name={"OTHER"}
                claimInputs={claimInputs.OTHER}
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
