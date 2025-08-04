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
import { createClaims, getClaimsById } from "@/services/claims";
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

export default function EditClaimForm() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<any>(null);
  const [claimInputs, setClaimInputs] = useState({
    isPreAuth: false,
    patientId: "",
    doctorName: "",
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
  const handleCreateClaim = async () => {
    try {
      const {
        CLINIC_PAPER,
        PAST_INVESTIGATION,
        CURRENT_INVESTIGATION,
        OTHER,
        ICP,
        preAuth,
        ...others
      } = claimInputs;
      const payload = {
        ...others,
        documents: [
          CLINIC_PAPER,
          ICP,
          PAST_INVESTIGATION,
          CURRENT_INVESTIGATION,
          ...(OTHER || []), // if OTHER is an array, ensure it's not null
        ].filter(Boolean),
      };
      setLoading(true);
      const res = await createClaims(payload);
      if (res.status == 201) {
        setLoading(false);
        router.push("/");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      // setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await getClaimsById(id);
      setClaims(res.data);
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
      isPreAuth: claims.isPreAuth,
      patientId: claims.patientId,
      doctorName: claims.doctorName,
      tpaName: claims.tpaName,
      insuranceCompany: claims.insuranceCompany,
      status: claims.status,
      description: claims.description,
      preAuth: "", // You can derive if needed
      additionalNotes: claims.additionalNotes || "",
      OTHER: documentMap.OTHER || [],
      CLINIC_PAPER: documentMap.CLINIC_PAPER || "",
      ICP: documentMap.ICP || "",
      CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION || "",
      PAST_INVESTIGATION: documentMap.PAST_INVESTIGATION || "",
      // SETTLEMENT_LETTER: documentMap.SETTLEMENT_LETTER || "",
    });
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
          isEditMode = {true}

      />
    </SidebarLayout>
  );
}
