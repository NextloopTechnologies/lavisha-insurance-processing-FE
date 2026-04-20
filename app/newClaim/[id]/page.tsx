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
import { createClaims, getClaimsById, updateClaims } from "@/services/claims";
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
import CreateClaim from "@/components/CreateClaim";
import { toast } from "sonner"; 
export default function EditClaimForm() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<any>(null);
  const [isClaimAssigned, setIsClaimAssigned] = useState<boolean>(false);
  const [initialHospitalId, setInitialHospitalId] = useState("");
  const [claimInputs, setClaimInputs] = useState({
    isPreAuth: false,
    patientId: "",
    doctorName: "Dr. ",
    tpaName: "",
    insuranceCompany: "",
    status: "",
    description: "",
    preAuth: "",
    OTHER: "",
    additionalNotes: "",
    PAST_INVESTIGATION: "",
    CURRENT_INVESTIGATION: "",
    CLINIC_PAPER: "",
    ICP: "",
  });
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const handleCreateClaim = async (value = null) => {

      if (Array.isArray(claimInputs.OTHER) && claimInputs.OTHER.length > 0) {
    const missingRemark = claimInputs.OTHER.some(
      (file) => !file.remark || file.remark.trim() === "" || file.remark === "custom remark"
    );
    if (missingRemark) {
      toast.error("Please add a note for all miscellaneous documents.");
      return;
    }
  }
    if (!!claims) {
      try {
        const {
          CLINIC_PAPER,
          PAST_INVESTIGATION,
          CURRENT_INVESTIGATION,
          OTHER,
          ICP,
          preAuth,
          status,
          ...others
        } = claimInputs;
        const removeKeys = (obj) => {
          delete obj.url;
          delete obj.file;
          return obj;
        };
        removeKeys(CLINIC_PAPER);
        removeKeys(PAST_INVESTIGATION);
        removeKeys(CURRENT_INVESTIGATION);
        removeKeys(OTHER);
        removeKeys(ICP);
        removeKeys(preAuth);
        removeKeys(status);
        if (Array.isArray(OTHER)) {
          OTHER.forEach(removeKeys);
        }
        const isNewUpload = (doc: any) => doc && !!doc.isNew;

        const payload = {
          ...others,
          status: value ? value : undefined,
          isBasicClaimUpdate: isClaimAssigned,
          ...((() => {
            const changed = [
              isNewUpload(CLINIC_PAPER) ? CLINIC_PAPER : null,
              isNewUpload(ICP) ? ICP : null,
              isNewUpload(PAST_INVESTIGATION) ? PAST_INVESTIGATION : null,
              isNewUpload(CURRENT_INVESTIGATION) ? CURRENT_INVESTIGATION : null,
              ...(Array.isArray(OTHER) ? OTHER.filter(isNewUpload) : []),
            ].filter(Boolean)
              .map(({ url, file, isNew, ...rest }) => rest);

            return changed.length > 0 ? { documents: changed } : {};
          })()),
        };
        setLoading(true);
        const res = await updateClaims(payload, id);
        if (res?.status == 200) {
           toast.success("Claim updated successfully!");
          setLoading(false);
          router.push("/claims");
        }
      } catch (error) {
        setLoading(false);
        console.error("Upload error:", error);
         toast.error("Failed to create claim. Please try again."); 
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const {
          CLINIC_PAPER,
          PAST_INVESTIGATION,
          CURRENT_INVESTIGATION,
          OTHER,
          ICP,
          preAuth,
          status,
          ...others
        } = claimInputs;
        const removeKeys = (obj) => {
          if(!obj){
            return;
          }
          delete obj.url;
          delete obj.file;
          return obj;
        };

        // Removing 'url' and 'file' from individual objects
        removeKeys(CLINIC_PAPER);
        removeKeys(PAST_INVESTIGATION);
        removeKeys(CURRENT_INVESTIGATION);
        removeKeys(OTHER);
        removeKeys(ICP);
        removeKeys(preAuth);
        removeKeys(status);
        if (Array.isArray(OTHER)) {
          OTHER.forEach(removeKeys);
        }
        const payload = {
          ...others,
          documents: [
            CLINIC_PAPER,
            ICP,
            PAST_INVESTIGATION,
            CURRENT_INVESTIGATION,
            ...(OTHER || []), 
          ].filter(Boolean),
        };
        setLoading(true);
        const res = await createClaims(payload);
        if (res?.status == 201) {
          setLoading(false);
          router.push("/claims");
        }
      } catch (error) {
        setLoading(false);
        console.error("Upload error:", error);
      } finally {
         setLoading(false);
      }
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await getClaimsById(id);
      setClaims(res.data);
      setIsClaimAssigned(res.data.assignee === null)
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    if (!claims) return;

    // Map documents by their type
    const documentMap = claims.documents.reduce((acc, doc) => {
      if (doc.type === "OTHER") {
        acc[doc.type] = acc[doc.type] || [];
        acc[doc.type].push({
          id: doc.id,
          fileName: doc.fileName,
          type: doc.type,
          remark: doc.remark,
          url: doc.url
        });
      } else {
        acc[doc.type] = {
          id: doc.id,
          fileName: doc.fileName,
          type: doc.type,
          url: doc.url
        };
      }
      return acc;
    }, {});

    setClaimInputs({
      isPreAuth: claims.isPreAuth,
      patientId: claims.patientId,
      doctorName: claims.doctorName,
      tpaName: claims.tpaName,
      insuranceCompany: claims.insuranceCompany,
      status: claims.status,
      description: claims.description,
      preAuth: "", 
      additionalNotes: claims.additionalNotes || "",
      OTHER: documentMap.OTHER || [],
      CLINIC_PAPER: documentMap.CLINIC_PAPER || "",
      ICP: documentMap.ICP || "",
      CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION || "",
      PAST_INVESTIGATION: documentMap.PAST_INVESTIGATION || "",
      // SETTLEMENT_LETTER: documentMap.SETTLEMENT_LETTER || "",
    });
    // conditional notification to assignee on updates
    // only from edit icon from actions
    setIsClaimAssigned(claims.assignee === null)


      if (claims.patient?.hospital?.id) {
    setInitialHospitalId(claims.patient.hospital.id);
  }
  }, [claims]);

  return (
    <SidebarLayout>
      {loading && <LoadingOverlay />}
      <CreateClaim
        handleCreateClaim={handleCreateClaim}
        loading={loading}
        setLoading={setLoading}
        claimInputs={claimInputs}
        setClaimInputs={setClaimInputs}
        isEditMode={!!claims}
        initialHospitalId={initialHospitalId} 

      />
    </SidebarLayout>
  );
}
