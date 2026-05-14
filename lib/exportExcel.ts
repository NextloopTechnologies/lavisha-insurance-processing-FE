import * as XLSX from "xlsx";
import { STATUS_LABELS } from "@/lib/utils";
import { format } from "date-fns";

type ClaimRow = {
  refNumber?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tpaName?: string;
  insuranceCompany?: string;
  assignee?: { id?: string; name?: string };
  dateOfAdmission?: string;
  dateOfDischarge?: string;
  diagnosis?: string;
  provisionalAmount?: string;
  actualQuotedAmount?: string;  // ← renamed
  patient: {
    name?: string;
    hospital?: {
      name?: string;
    };
  };
};

export function exportClaimsToExcel(
  claims: ClaimRow[],
  fileName = "Claims_Report"
) {
  if (!claims || claims.length === 0) return;

  const rows = claims.map((claim, index) => {
    const previousAmount = parseFloat(claim.provisionalAmount ?? "0") || 0;
    const finalAmount = parseFloat(claim.actualQuotedAmount ?? "0") || 0;  // ← renamed
    const increasedAmount = finalAmount - previousAmount;

    return {
      "Sr. No": index + 1,
      "Claim ID": claim.refNumber ?? "",
      "Patient Name": claim.patient?.name ?? "",
      "Hospital Name": claim.patient?.hospital?.name ?? "",
      Status: STATUS_LABELS[claim.status] ?? claim.status ?? "",
      "TPA Name": claim.tpaName ?? "",
      "Insurance Company": claim.insuranceCompany ?? "",
      "Assignee": claim.assignee?.name ?? "",
      "Admission Date": claim.dateOfAdmission
        ? format(new Date(claim.dateOfAdmission), "yyyy/MM/dd") : "",
      "Discharge Date": claim.dateOfDischarge
        ? format(new Date(claim.dateOfDischarge), "yyyy/MM/dd") : "",
      "Diagnosis": claim.diagnosis ?? "",
      "Previous Amount": previousAmount || "",
      "Final Amount": finalAmount || "",

      //  Computed only in Excel
      "Increased Amount": finalAmount && previousAmount
        ? increasedAmount
        : "",

      "Created Date": claim.createdAt
        ? format(new Date(claim.createdAt), "yyyy/MM/dd") : "",
      "Updated Date": claim.updatedAt
        ? format(new Date(claim.updatedAt), "yyyy/MM/dd") : "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colKeys = Object.keys(rows[0]);
  worksheet["!cols"] = colKeys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String(r[key] ?? "").length)
    );
    return { wch: maxLen + 4 };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}