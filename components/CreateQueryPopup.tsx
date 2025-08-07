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
import { createQuery, updateQuery } from "@/services/query";
import { DialogClose } from "@radix-ui/react-dialog";
interface CreateEnhancementPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { name: string; age: number; image?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string };
  isEditMode?: boolean;
  selectedTab: string;
  data?: any;
  claimId?: ParamValue;
  selectedQuery?: any;
  updateClaimStatusAfterModalSuccess?: (status: string) => Promise<void>;
  onClose?: () => void;
  fetchClaimsById?: any;
  setSelectedQuery?: any;
}

export default function CreateQueryPopup({
  open,
  onOpenChange,
  onSubmit,
  defaultData,
  isEditMode = false,
  selectedTab,
  data,
  claimId,
  selectedQuery,
  updateClaimStatusAfterModalSuccess,
  onClose,
  fetchClaimsById,
  setSelectedQuery,
}: CreateEnhancementPopupProps) {
  const [loading, setLoading] = useState(false);
  const [queryInputs, setQueryInputs] = useState<any>({
    doctorName: "Dr. ",
    status: "QUERIED",
    OTHER: "",
    ICP: "",
    notes: "",
    EXCEL_REPORT: "",
    CURRENT_INVESTIGATION: "",
  });
  useEffect(() => {
    if (!selectedQuery) {
      setQueryInputs({
        doctorName: "Dr. ",
        status: "QUERIED",
        OTHER: "",
        ICP: "",
        notes: "",
        EXCEL_REPORT: "",
        CURRENT_INVESTIGATION: "",
      });
    } else {
      // Map documents by their type
      const documentMap = selectedQuery?.documents?.reduce((acc, doc) => {
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

      setQueryInputs({
        notes: selectedQuery?.notes,
        OTHER: documentMap.OTHER || [],
        ICP: documentMap.ICP || "",
        EXCEL_REPORT: documentMap.EXCEL_REPORT || "",
        CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION || "",

        //   CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION || "",
        //   PAST_INVESTIGATION: documentMap.PAST_INVESTIGATION || "",
        //   SETTLEMENT_LETTER: documentMap.SETTLEMENT_LETTER || "",
      });
    }
  }, [selectedQuery]);

  const handleSelectChange = (value: string | boolean, name: string) => {
    setQueryInputs((prev) => {
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

        setQueryInputs((prev) => ({
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
        setQueryInputs((prev) => ({
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

  const handleCreateQuery = async () => {
    if (selectedQuery?.id) {
      try {
        const {
          OTHER,
          ICP,
          insuranceRequestId,
          status,
          numberOfDays,
          CURRENT_INVESTIGATION,
          EXCEL_REPORT,
          doctorName,
          ...others
        } = queryInputs;
        const payload = {
          ...others,
          insuranceRequestId: claimId,
          documents: [
            ICP,
            CURRENT_INVESTIGATION,
            EXCEL_REPORT,
            ...(OTHER || []), // if OTHER is an array, ensure it's not null
          ].filter(Boolean),
        };
        setLoading(true);
        const res = await updateQuery(payload, selectedQuery?.id);
        if (res?.status == 200) {
          await updateClaimStatusAfterModalSuccess("QUERIED");
          await fetchClaimsById();
          setLoading(false);
          onOpenChange(!open);
          setSelectedQuery(null);
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        // setLoading(false);
      }
    } else {
      try {
        const {
          OTHER,
          ICP,
          insuranceRequestId,
          status,
          numberOfDays,
          CURRENT_INVESTIGATION,
          EXCEL_REPORT,
          doctorName,
          ...others
        } = queryInputs;
        const payload = {
          ...others,
          insuranceRequestId: claimId,
          documents: [
            ICP,
            CURRENT_INVESTIGATION,
            EXCEL_REPORT,
            ...(OTHER || []), // if OTHER is an array, ensure it's not null
          ].filter(Boolean),
        };
        setLoading(true);
        const res = await createQuery(payload);
        if (res?.status == 201) {
          await updateClaimStatusAfterModalSuccess("QUERIED");
          await fetchClaimsById();
          onOpenChange(!open);
          setSelectedQuery(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        // setLoading(false);
      }
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedQuery(null);
    }
    onClose?.();
    onOpenChange(isOpen);
  };
  return (
    <>
      {loading && <LoadingOverlay />}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="min-w-5xl max-w-md text-center  p-8 rounded-lg ">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Edit ${selectedTab}` : `Create ${selectedTab}`}
            </DialogTitle>
          </DialogHeader>
          <div className="realtive  w-full h-[calc(100vh-250px)] overflow-y-auto">
            <div className="bg-white  w-full  mx-auto mt-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* <Input
                  placeholder="Doctor Name"
                  className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                  value={queryInputs.doctorName}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "doctorName")
                  }
                /> */}

                {/* <Input
                  type="number"
                  placeholder="Number of Days"
                  className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                  value={queryInputs.numberOfDays}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "numberOfDays")
                  }
                /> */}
              </div>

              <div className="my-4">
                <textarea
                  value={queryInputs.notes}
                  onChange={(e) => handleSelectChange(e.target.value, "notes")}
                  placeholder="Description"
                  className="bg-[#F2F7FC] pl-2 text-sm font-semibold text-black  min-h-[100px] outline-blue-300  focus:outline-border w-full"
                />
              </div>

              {/* Upload Fields */}

              <FileDrag
                title={"Excel Report"}
                multiple={false}
                onChange={handleFileChange}
                name={"EXCEL_REPORT"}
                claimInputs={queryInputs?.EXCEL_REPORT}
              />

              <FileDrag
                title={"ICP"}
                multiple={false}
                onChange={handleFileChange}
                name={"ICP"}
                claimInputs={queryInputs?.ICP}
              />
              <FileDrag
                title={"Investigation"}
                multiple={false}
                onChange={handleFileChange}
                name={"CURRENT_INVESTIGATION"}
                claimInputs={queryInputs?.CURRENT_INVESTIGATION}
              />

              <FileDrag
                title={"Miscellaneous Documents"}
                multiple={true}
                onChange={handleFileChange}
                name={"OTHER"}
                claimInputs={queryInputs?.OTHER}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-4 absolute bottom-5 right-5">
                <DialogClose asChild>
                  <Button
                    // onClick={handleClose}
                    className="text-[#3E79D6]"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button
                  onClick={handleCreateQuery}
                  className="bg-[#3E79D6]  px-4"
                >
                  {isEditMode
                    ? `Update ${selectedTab}`
                    : `Create ${selectedTab}`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
