"use client";

import FileDrag from "@/components/FileDrag";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner"; 
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
import { useRouter, useSearchParams } from "next/navigation";

// import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, UploadCloud } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, } from "react";
import Image from "next/image";
import { userRound } from "@/assets";
import PatientFormDialog from "@/components/CreateEdit";
import LoadingOverlay from "@/components/LoadingOverlay";
import CreateClaim from "@/components/CreateClaim";

export default function NewClaimsContent() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<any>(null);
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");

  const [claimInputs, setClaimInputs] = useState({
    isPreAuth: false,
    patientId: patientIdFromQuery || "",
    doctorName: "DR. ",
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

    //  Pure function — never mutates state
    const cleanDoc = ({ url, file, ...rest }: any) => rest;

    const documents = [
      CLINIC_PAPER ? cleanDoc(CLINIC_PAPER) : null,
      ICP ? cleanDoc(ICP) : null,
      PAST_INVESTIGATION ? cleanDoc(PAST_INVESTIGATION) : null,
      CURRENT_INVESTIGATION ? cleanDoc(CURRENT_INVESTIGATION) : null,
      //  OTHER is an array — map each file through cleanDoc
      ...(Array.isArray(OTHER) ? OTHER.map(cleanDoc) : []),
    ].filter(Boolean);

    const payload = { ...others, documents };

    setLoading(true);
    if (value) {
      const res = await createClaims({ ...payload, status: value });

      if (res?.status == 201) {
        toast.success("Claim updated successfully!");
        setLoading(false);
        router.push("/claims");
      }
    } else {
      const res = await createClaims(payload);
      if (res?.status == 201) {
        setLoading(false);
        toast.success("Claim created  successfully!");
        router.push("/claims");
      }
    }
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Failed to create claim. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const fetchClaims = async () => {
    try {
      const res = await getClaimsById(id);
      if (res?.status == 200) {
        setClaims(res?.data);
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <SidebarLayout>
      {loading && <LoadingOverlay />}
      <CreateClaim
        handleCreateClaim={handleCreateClaim}
        loading={loading}
        setLoading={setLoading}
        claimInputs={claimInputs}
        setClaimInputs={setClaimInputs}
      />
    </SidebarLayout>
  );
}
