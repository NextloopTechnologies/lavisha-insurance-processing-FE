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

export function getFileIconType(fileName:string) {
  const extension = fileName.split('.').pop().toLowerCase();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const pdfExtensions = ['pdf'];
  const excelExtensions = ['xls', 'xlsx'];

  if (imageExtensions.includes(extension)) return 'image';    // use 🖼️ or an <ImageIcon />
  if (pdfExtensions.includes(extension)) return 'pdf';         // use 📄 or a <PdfIcon />
  if (excelExtensions.includes(extension)) return 'excel';     // use 📊 or a <ExcelIcon />
  
  return 'file'; // default generic file 📁
}
