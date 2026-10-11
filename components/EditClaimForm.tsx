"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClaims, getClaimsById, updateClaims } from "@/services/claims";
import LoadingOverlay from "@/components/LoadingOverlay";
import CreateClaim from "@/components/CreateClaim";
import { startOfTodayISO } from "@/lib/utils";
import { CLAIM_DOC_TYPES, collectDocuments, groupDocuments, hasMissingRemarks } from "@/lib/claimDocuments";

interface EditClaimFormProps {
  /** claim already loaded by the parent; when omitted the form loads it from the route's ref number */
  claim?: any;
  /** rendered inside the claim workspace: save keeps the user on the page and calls onSaved */
  embedded?: boolean;
  onSaved?: () => void | Promise<void>;
}

const emptyInputs = {
  isPreAuth: false,
  patientId: "",
  doctorName: "Dr. ",
  tpaName: "",
  insuranceCompany: "",
  status: "",
  description: "",
  PRE_AUTH: "",
  OTHER: "",
  additionalNotes: "",
  PAST_INVESTIGATION: "",
  CURRENT_INVESTIGATION: "",
  CLINIC_PAPER: "",
  ICP: "",
  dateOfAdmission: "",
  diagnosis: "",
  provisionalAmount: "",
};

/** Form state for an existing claim (documents grouped by type). */
function inputsFromClaim(claims: any) {
  const documentMap = groupDocuments(claims.documents, CLAIM_DOC_TYPES);

  return {
    isPreAuth: claims.isPreAuth,
    patientId: claims.patientId,
    doctorName: claims.doctorName,
    tpaName: claims.tpaName,
    insuranceCompany: claims.insuranceCompany,
    status: claims.status,
    description: claims.description,
    PRE_AUTH: documentMap.PRE_AUTH,
    additionalNotes: claims.additionalNotes || "",
    OTHER: documentMap.OTHER,
    CLINIC_PAPER: documentMap.CLINIC_PAPER,
    ICP: documentMap.ICP,
    CURRENT_INVESTIGATION: documentMap.CURRENT_INVESTIGATION,
    PAST_INVESTIGATION: documentMap.PAST_INVESTIGATION,
    // SETTLEMENT_LETTER: documentMap.SETTLEMENT_LETTER || "",
    dateOfAdmission: claims.dateOfAdmission || "",
    diagnosis: claims.diagnosis || "",
    provisionalAmount: claims.provisionalAmount || "",
  };
}

export default function EditClaimForm({ claim, embedded = false, onSaved }: EditClaimFormProps) {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<any>(claim ?? null);
  const [isClaimAssigned, setIsClaimAssigned] = useState<boolean>(false);
  const [initialHospitalId, setInitialHospitalId] = useState("");
  // start from the claim when the workspace passes one in, so a remount after a save never
  // renders a blank form (blank status would briefly show "Save as Draft")
  const [claimInputs, setClaimInputs] = useState<any>(() =>
    claim ? inputsFromClaim(claim) : { ...emptyInputs, dateOfAdmission: startOfTodayISO() },
  );
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const handleCreateClaim = async (value = null) => {

    if (hasMissingRemarks(claimInputs, CLAIM_DOC_TYPES)) {
      toast.error("Please add a note for all miscellaneous documents.");
      return;
    }
    if (!!claims) {
      try {
        const {
          CLINIC_PAPER,
          PAST_INVESTIGATION,
          CURRENT_INVESTIGATION,
          OTHER,
          ICP,
          PRE_AUTH,
          status,
          ...others
        } = claimInputs;
        const changed = collectDocuments(claimInputs, CLAIM_DOC_TYPES, { onlyNew: true });

        const payload = {
          ...others,
          status: value ? value : undefined,
          isBasicClaimUpdate: isClaimAssigned,
          ...(changed.length > 0 ? { documents: changed } : {}),
        };
        setLoading(true);
        const res = await updateClaims(payload, id);
        if (res?.status == 200) {
           toast.success("Claim updated successfully!");
          setLoading(false);
          if (embedded) await onSaved?.();
          else router.push("/claims");
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
          PRE_AUTH,
          status,
          ...others
        } = claimInputs;
        const payload = {
          ...others,
          documents: collectDocuments(claimInputs, CLAIM_DOC_TYPES),
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

  // standalone: load the claim; embedded: the parent passes it in
  useEffect(() => {
    if (!claim) fetchClaims();
  }, []);

  // fill the form once per loaded claim (the workspace remounts this form after a save)
  useEffect(() => {
    if (!claims) return;

    setClaimInputs(inputsFromClaim(claims));
    // conditional notification to assignee on updates
    // only from edit icon from actions
    setIsClaimAssigned(claims.assignee === null)


      if (claims.patient?.hospital?.id) {
    setInitialHospitalId(claims.patient.hospital.id);
  }
  }, [claims?.id]);

  // the workspace can change the status (status picker, popups): follow it without
  // discarding unsaved form edits, so "Update Claim" never sends an outdated status
  useEffect(() => {
    if (!claim) return;
    setClaims(claim);
    setClaimInputs((prev) => (prev.status && prev.status !== claim.status ? { ...prev, status: claim.status } : prev));
    setIsClaimAssigned(claim.assignee === null);
  }, [claim]);

  return (
    <>
      {loading && <LoadingOverlay />}
      <CreateClaim
        handleCreateClaim={handleCreateClaim}
        loading={loading}
        setLoading={setLoading}
        claimInputs={claimInputs}
        setClaimInputs={setClaimInputs}
        isEditMode={!!claims}
        initialHospitalId={initialHospitalId}
        embedded={embedded}
      />
    </>
  );
}
