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
import { createEnhancements } from "@/services/enhancement";
interface CreateEnhancementPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { name: string; age: number; image?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string };
  isEditMode?: boolean;
  selectedTab: string;
  data?: any;
  claimId: ParamValue;
  selectedEnhancement: any;
  fetchEnhancement:any
}

export default function CreateEnhancementPopup({
  open,
  onOpenChange,
  onSubmit,
  defaultData,
  isEditMode = false,
  selectedTab,
  data,
  claimId,
  selectedEnhancement,
  fetchEnhancement
}: CreateEnhancementPopupProps) {
  const [loading, setLoading] = useState(false);
  const [enhancementInputs, setEnhancementInputs] = useState<any>({
    doctorName: "",
    status: "ENHANCEMENT",
    OTHER: "",
    ICP: "",
    numberOfDays: "",
    notes: "",
  });
  useEffect(() => {
    if (!selectedEnhancement) return;

    // Map documents by their type
    const documentMap = selectedEnhancement.documents.reduce((acc, doc) => {
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

    setEnhancementInputs({
      doctorName: selectedEnhancement.doctorName,
      notes: selectedEnhancement?.notes,
      numberOfDays: selectedEnhancement?.numberOfDays,

      OTHER: documentMap.OTHER || [],
      ICP: documentMap.ICP || "",
    });
  }, [selectedEnhancement]);
  const handleSelectChange = (value: string | boolean, name: string) => {
    setEnhancementInputs((prev) => {
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

        setEnhancementInputs((prev) => ({
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
        setEnhancementInputs((prev) => ({
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

  const handleCreateEnhancement = async () => {
    try {
      const {
        OTHER,
        ICP,
        insuranceRequestId,
        status,
        numberOfDays,
        ...others
      } = enhancementInputs;
      const payload = {
        ...others,
        status,
        insuranceRequestId: claimId,
        numberOfDays: Number(numberOfDays),
        documents: [
          ICP,
          ...(OTHER || []), // if OTHER is an array, ensure it's not null
        ].filter(Boolean),
      };
      setLoading(true);
      const res = await createEnhancements(payload);
      if (res.status == 201) {
        setLoading(false);
        onOpenChange(!open);
        fetchEnhancement()
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      // setLoading(false);
    }
  };
  const handleClose = () => {
    onOpenChange(!open);
  };
  return (
    <>
      {loading && <LoadingOverlay />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-5xl max-w-md text-center  p-8 rounded-lg ">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Patient" : `Create ${selectedTab}`}
            </DialogTitle>
          </DialogHeader>
          <div className="realtive  w-full h-[calc(100vh-250px)] overflow-y-auto">
            <div className="bg-white  w-full  mx-auto mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Doctor Name"
                  className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                  value={enhancementInputs.doctorName}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "doctorName")
                  }
                />

                <Input
                  type="number"
                  placeholder="Number of Days"
                  className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                  value={enhancementInputs.numberOfDays}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "numberOfDays")
                  }
                />
              </div>

              <div className="my-4">
                <textarea
                  value={enhancementInputs.notes}
                  onChange={(e) => handleSelectChange(e.target.value, "notes")}
                  placeholder="Description"
                  className="bg-[#F2F7FC] pl-2 text-sm font-semibold text-black  min-h-[100px] outline-blue-300  focus:outline-border w-full"
                />
              </div>

              {/* Upload Fields */}

              <FileDrag
                title={"ICP"}
                multiple={false}
                onChange={handleFileChange}
                name={"ICP"}
                claimInputs={enhancementInputs?.ICP}
              />

              <FileDrag
                title={"Miscellaneous Documents"}
                multiple={true}
                onChange={handleFileChange}
                name={"OTHER"}
                claimInputs={enhancementInputs?.OTHER}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-4 absolute bottom-0 right-5">
                <Button
                  onClick={handleClose}
                  className="text-[#3E79D6]"
                  variant="outline"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleCreateEnhancement}
                  className="bg-[#3E79D6] px-4"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
