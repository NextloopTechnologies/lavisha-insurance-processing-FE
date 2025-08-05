import { statusOptions } from "@/constants/menu";
import { StatusType } from "@/types/claims";
import { clsx, type ClassValue } from "clsx";
import { addDays, subMonths, subYears } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const predefinedRanges = [
  {
    label: "Last 7 Days",
    range: () => ({ from: addDays(new Date(), -6), to: new Date() }),
  },
  {
    label: "Last 1 Month",
    range: () => ({ from: subMonths(new Date(), 1), to: new Date() }),
  },
  {
    label: "Last 6 Month",
    range: () => ({ from: subMonths(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last 1 Year",
    range: () => ({ from: subYears(new Date(), 1), to: new Date() }),
  },
  {
    label: "Last 2 Year",
    range: () => ({ from: subYears(new Date(), 2), to: new Date() }),
  },
  {
    label: "Last 3 Year",
    range: () => ({ from: subYears(new Date(), 3), to: new Date() }),
  },
];

export function getFileIconType(fileName: string) {
  const extension = fileName.split(".").pop().toLowerCase();

  const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
  const pdfExtensions = ["pdf"];
  const excelExtensions = ["xls", "xlsx"];

  if (imageExtensions.includes(extension)) return "image"; // use 🖼️ or an <ImageIcon />
  if (pdfExtensions.includes(extension)) return "pdf"; // use 📄 or a <PdfIcon />
  if (excelExtensions.includes(extension)) return "excel"; // use 📊 or a <ExcelIcon />

  return "file"; // default generic file 📁
}

export function formatDateTime(isoString) {
  if (!isoString) return { date: "", time: "" };

  const dateObj = new Date(isoString);

  const date = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date, time };
}

export function formatRaisedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export const getStatusVisibility = (currentStatus: string) => {
  const index = statusOptions.findIndex((s) => s.key === currentStatus);

  if (index === -1) return [];

  if (currentStatus === StatusType.QUERIED) {
    return statusOptions.slice(index, index + 3);
  }
  if (currentStatus === StatusType.APPROVED) {
    return statusOptions.slice(index); // from approved to settled
  }

  return statusOptions.slice(index, index + 2); // current and next
};

export const statusMaxIndexMap: Record<string, number> = {
  PENDING: 1,
  SENT_TO_TPA: 1,
  QUERIED: 2,
  DENIED: 2,
  APPROVED: 2,
  ENHANCEMENT: 3,
  DISCHARGED: 4,
  SETTLED: 5,
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  SENT_TO_TPA: "Sent to TPA",
  QUERIED: "Queried",
  DENIED: "Denied",
  ENHANCEMENT: "Enhancement",
  DISCHARGED: "Dishcharged",
  SETTLED: "Settled",
};
