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

export default function CreateSettlementPopup({
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
  fetchClaimsById,
}: CreateSettlementPopupProps) {
  const [loading, setLoading] = useState(false);
  const [claimInputs, setClaimInputs] = useState<any>({
    isPreAuth: false,
    patientId: "",
    doctorName: "Dr. ",
    tpaName: "",
    insuranceCompany: "",
    status: StatusType.SETTLED,
    description: "",
        preAuth: "",
    OTHER: "",
    additionalNotes: "",
    PAST_INVESTIGATION: "",
    CURRENT_INVESTIGATION: "",
    CLINIC_PAPER: "",
    ICP: "",
    SETTLEMENT_LETTER: "",
    settlementSummary: "",
    settlementAmount: "",
    actualQuotedAmount: "",
    totalBill: "",
    totalApproval: "",
    transactionId: "",
    tds: "",
    deduction: "",
    SETTLEMENT_OTHER: [], 
  });

  useEffect(() => {
    if (!data) return;

     // Map documents by their type
   
    const documentMap = data.documents.reduce((acc, doc) => {
  // Both OTHER and SETTLEMENT_OTHER are arrays
  if (doc.type === "OTHER" || doc.type === "SETTLEMENT_OTHER") {
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
      settlementSummary: data?.settlementSummary || "",
      settlementAmount: data?.settlementAmount || "",
      actualQuotedAmount: data?.actualQuotedAmount || "",
      preAuth: "",
      additionalNotes: data.additionalNotes || "",
      OTHER: documentMap.OTHER || [],
      CLINIC_PAPER: documentMap.CLINIC_PAPER || "",
      ICP: documentMap.ICP || "",
      CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION || "",
      PAST_INVESTIGATION: documentMap.PAST_INVESTIGATION || "",
      SETTLEMENT_LETTER: documentMap.SETTLEMENT_LETTER || "",
      SETTLEMENT_OTHER: documentMap.SETTLEMENT_OTHER || [], 
      totalBill: data?.totalBill || "",
      totalApproval: data?.totalApproval || "",
      transactionId: data?.transactionId || "",
      tds: data?.tds || "",
      deduction: data?.deduction || ""
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
  //  Remove handler
  if (name === "remove") {
    if (value.type === "OTHER" || value.type === "SETTLEMENT_OTHER") {
      setClaimInputs((prev) => ({
        ...prev,
        [value.type]: Array.isArray(prev[value.type])
          ? prev[value.type].filter((file) => {
              if (value.id && file.id) return file.id !== value.id;
              return file.fileName !== value.fileName;
            })
          : [],
      }));
      toast.success("File removed successfully");
    } else {
      setClaimInputs((prev) => ({
        ...prev,
        [value.type]: "",
      }));
      toast.success("File removed successfully");
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

      //  Append to existing array
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

  const handleCreateSettlement = async () => {
  try {
    const {
      CLINIC_PAPER, PAST_INVESTIGATION, CURRENT_INVESTIGATION,
      OTHER, ICP, preAuth, status, SETTLEMENT_LETTER, description,
      settlementSummary, settlementAmount, actualQuotedAmount,
      DISCHARGE_OTHER, SETTLEMENT_OTHER, totalBill, totalApproval,
      transactionId, tds, deduction, ...others
    } = claimInputs;

    //  Pure function — never mutates state
    const cleanDoc = ({ url, file, ...rest }: any) => rest;

    const documents = [
      SETTLEMENT_LETTER ? cleanDoc(SETTLEMENT_LETTER) : null,
      ...(Array.isArray(SETTLEMENT_OTHER) ? SETTLEMENT_OTHER.map(cleanDoc) : []),
      ...(Array.isArray(OTHER) ? OTHER.map(cleanDoc) : []),
    ].filter(Boolean);

    const payload = {
      ...others,
      settlementSummary,
      settlementAmount,
      actualQuotedAmount,
      totalBill,
      totalApproval,
      transactionId,
      tds,
      deduction,
      status: StatusType.SETTLED,
      documents,
    };

    setLoading(true);
    const res = await updateClaims(payload, claimId);
    if (res?.status === 200) {
      fetchClaimsById();
      await updateClaimStatusAfterModalSuccess?.(StatusType.SETTLED);
      setModalProcessingStatus?.("");
      onOpenChange(!open);
      toast.success("Updated Claim with Settlement!");
    }
  } catch (error) {
    toast.error("Failed to update claim with settlement!");
    console.error("Upload error:", error);
  } finally {
    setLoading(false);
  }
};
  const handleClose = () => {
    setModalProcessingStatus?.("");
    onOpenChange(!open);
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-5xl max-w-lg text-center p-8 rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Edit ${selectedTab}` : `Create ${selectedTab}`}
            </DialogTitle>
          </DialogHeader>
          <div className="realtive w-full">
            <div className="bg-white  w-full  mx-auto mt-4">
              {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <Input
                  placeholder="Doctor Name"
                  className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                  value={claimInputs.doctorName}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "doctorName")
                  }
                />
              </div> */}

              <div className="my-4">
            <textarea
              value={claimInputs.settlementSummary}
              onChange={(e) =>
                handleSelectChange(e.target.value, "settlementSummary")
              }
              placeholder="Settlement Summary"
                  className="bg-[#F2F7FC] pl-2 text-sm font-semibold text-black  min-h-[100px] outline-blue-300  focus:outline-border w-full"
            />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 mb-4 gap-4">
               
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Total Bill"
                value={claimInputs.totalBill}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "totalBill")
                }
              />
              <Input
                placeholder="Total Approval"
                value={claimInputs.totalApproval}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "totalApproval")
                }
              />
              <Input
                placeholder="Total Settled Amount"
                value={claimInputs.settlementAmount}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "settlementAmount")
                }
              />
              <Input
                placeholder="Transaction ID"
                value={claimInputs.transactionId}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "transactionId")
                }
              />
              <Input
                placeholder="TDS"
                value={claimInputs.tds}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "tds")
                }
              />
              <Input
                placeholder="Deduction"
                value={claimInputs.deduction}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "deduction")
                }
              />
              {/* <Input
                type="date"
                placeholder="Settlement Date"
                title="Settlement Date"
                aria-placeholder="Settlement Date"
                value={claimInputs.settlementDate}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "settlementDate")
                }
              />
              <Input
                type="date"
                placeholder="Updated Date"
                value={claimInputs.updatedDate}
                onChange={(e) =>
                  handleSelectChange(e.target.value, "updatedDate")
                }
              /> */}
            </div>

            {/*  Upload Section */}
            <FileDrag
                title={"Settlement"}
              multiple={false}
                onChange={handleFileChange}
                name={"SETTLEMENT_LETTER"}
              claimInputs={claimInputs?.SETTLEMENT_LETTER ? [claimInputs?.SETTLEMENT_LETTER] : []}
            />

            <FileDrag
                title={"Miscellaneous Documents"}
              multiple={true}
                onChange={handleFileChange}
                name={"SETTLEMENT_OTHER"}
              // claimInputs={claimInputs?.SETTLEMENT_OTHER ? [claimInputs?.SETTLEMENT_OTHER] : []}
               claimInputs={Array.isArray(claimInputs?.SETTLEMENT_OTHER) ? claimInputs?.SETTLEMENT_OTHER : []}
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
                onClick={handleCreateSettlement}
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
