import { statusOptions } from "@/constants/menu";
import { STATUS_NAMES, statusChoices } from "@/lib/claimStatus";
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

/** Local midnight today as ISO — the default Date of Admission for new claims. */
export function startOfTodayISO() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
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

export function formatRaisedDate(
  dateStr: string,
  format?: string | "YYYY-MM-DD"
): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Options for the status selector: the current status followed by where it can go next. */
export const getStatusVisibility = (currentStatus: StatusType) =>
  statusChoices(currentStatus)
    .map((key) => statusOptions.find((s) => s.key === key))
    .filter(Boolean);

// last tab index (in ClaimWorkspace allTabLabels) visible for each status;
// Queried / Enhancement tabs still only show when the claim has that data
export const statusMaxIndexMap: Record<string, number> = {
  PENDING: 1,
  SENT_TO_TPA: 1,
  QUERIED: 3,
  QUERY_REPLY_SENT: 3,
  DENIED: 3,
  APPROVED: 3,
  ENHANCEMENT: 3,
  DISCHARGE_INITIATED: 4,
  DISCHARGE_SENT: 4,
  DISCHARGED: 4,
  SETTLEMENT_INITIATED: 4,
  SETTLED: 5,
};

type TabVisibilityRule = {
  tab: string;
  minIndex: number; // index in allTabLabels when this tab becomes visible
  shouldShow: (res: any) => boolean;
};

const tabVisibilityRules: TabVisibilityRule[] = [
  {
    tab: "Queried",
    minIndex: 2, 
    shouldShow: (res) => (res?.queries?.length ?? 0) > 0,
  },
  {
    tab: "Enhancement",
    minIndex: 3,
    shouldShow: (res) => (res?.enhancements?.length ?? 0) > 0,
  },
];

export const filterTabsByData = (tabs: string[], res: any): string[] => {
  return tabs.filter((tab, idx) => {
    const rule = tabVisibilityRules.find((r) => r.tab === tab);
    if (!rule) return true; // no rule → always visible
    if (idx < rule.minIndex) return true; // not yet reached status
    return rule.shouldShow(res); // apply condition
  });
};

export const STATUS_LABELS: Record<string, string> = STATUS_NAMES;
