"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Copy,
  EllipsisVertical,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MultiSelect } from "./MultiSelect";
import Link from "next/link";
import { statusOptions } from "@/constants/menu";
import DeletePopup from "./DeletePopup";
import { StatusType } from "@/types/claims";
import { format } from "date-fns";
import { STATUS_LABELS } from "@/lib/utils";
import AssigneeDropdown from "./AssigneeDropdown";
import { UserRole } from "@/types/comments";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { markCommentsAsRead } from "@/services/comments";
type User = {
  id: number;
  patientName: string;
  status: string;
  doctor: string;
  createdDate: string;
  description: string;
  claimId: string;
  preAuthStatus: string;
};
type DATA = {
  id?: number;
  patientName?: string;
  status?: string;
  doctorName?: string;
  createdAt: string;
  updatedAt:string;
  description?: string;
  claimId: string;
  refNumber?: string;
  isPreAuth: string;
  tpaName?: string;
  insuranceCompany?: string;
  assignee?: { id: string };
  patient: {
    id?: string;
    name?: string;
    hospital?: {
      id: string;
      name: string;
    };
  };
  commentsCountMap: { [key: string]: number };
};
export const eyeTap = async (roles: string[], refNumber: Number) => {
  try {
    const response = await markCommentsAsRead(refNumber, roles[0]);
    return response.data;
  } catch (error) {
    console.error("Failed to mark comments as read:", error);
  }
 
};

export function DataTable({
  data,
  sortByClaim,
  page,
  setPage,
  total,
  handleDeleteClaim,
  getSearchData,
  initialSearchTerm = "",
  roles,
  setClaims,
  users,
  commentsCountMap,
}: {
  roles?: string[];
  data: DATA[];
  sortByClaim: any;
  page: number;
  setPage: any;
  total: number;
  handleDeleteClaim: any;
  getSearchData: (value?: string[] | string | Date, name?: string) => void;
  initialSearchTerm?: string;
  setClaims?: any;
  users?: { id?: string; name?: string; role?: string }[];
  commentsCountMap: { [key: string]: number };
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const router = useRouter();
  const [isClaimAssigned, setIsClaimAssigned] = useState<boolean>(false);
  const [assignedClaimRefNumber, setAssignedClaimRefNumber] = useState<string>("");

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      setDebouncedSearchTerm(initialSearchTerm);
      getSearchData(initialSearchTerm, "debouncedSearchTerm");
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    if (selectedStatuses?.length >= 0) {
      setPage(1);
      getSearchData(selectedStatuses, "selectedStatuses");
    }
  }, [selectedStatuses]);

  useEffect(() => {
    if (selectedDate || selectedDate == undefined) {
      setPage(1);
      getSearchData(selectedDate, "selectedDate");
    }
  }, [selectedDate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
      getSearchData(searchTerm, "debouncedSearchTerm");
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const totalPages = Math.ceil(total);

  const thStyle = {
    position: "sticky" as const,
    top: 0,
    backgroundColor: "#3E79D6",
    color: "white",
    zIndex: 10,
  };

  return (
    <div className="min-h-[calc(100vh-75px)] p-4">
      {/* Top bar */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <div className="flex gap-2 md:flex-wrap">
          <div className="relative">
            <Input
              placeholder="Search here"
              className="pl-10 w-[180px] md:w-56 bg-white rounded-4xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-[#3E79D6]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
              </svg>
            </span>
          </div>
          <MultiSelect
            mode="multi"
            selectedStatuses={selectedStatuses}
            status={statusOptions}
            toggleStatus={toggleStatus}
            setSelectedStatuses={setSelectedStatuses}
          />
          <div>
            <DatePicker date={selectedDate} onChange={setSelectedDate} disableFuture />
            {selectedDate && (
              <span className="text-2xl ml-2 cursor-pointer" onClick={() => setSelectedDate(undefined)}>
                X
              </span>
            )}
          </div>
        </div>
        <>
          <Button
            onClick={() => router.push("/newClaim")}
            className="bg-[#3E79D6] hover:bg-[#3E79D6] text-white rounded-sm hidden md:flex cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" /> New Claim
          </Button>
          <Plus onClick={() => router.push("/newClaim")} className="mr-2 h-4 w-4 block md:hidden cursor-pointer" />
        </>
      </div>

      {/* Table */}
      <div
        className="rounded-sm bg-white border"
        style={{
          height: "calc(100vh - 210px)",
          overflowY: "auto",
          overflowX: "scroll",
        }}
      >
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">
                Patient Name
              </th>
              {(roles?.includes(UserRole.ADMIN) || roles?.includes(UserRole.SUPER_ADMIN)) && (
                <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">
                  Hospital Name
                </th>
              )}
              <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">Claim ID</th>
              <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">Description</th>
              <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">Status</th>
              <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">Updated Date</th>
              {/* <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">Dr. Name</th> */}
              {/* <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">Pre-Auth Status</th> */}
              {(roles?.includes(UserRole.ADMIN) || roles?.includes(UserRole.SUPER_ADMIN)) && (
                <th style={thStyle} className="border py-2 px-3 text-left text-sm font-normal whitespace-nowrap">Assignee</th>
              )}
              <th style={thStyle} className="border py-2 px-3 text-center text-sm font-normal whitespace-nowrap">Action</th>
           
            </tr>
          </thead>
          <tbody className="bg-white">
            {data?.length
              ? data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border py-2 px-3 text-sm">{row?.patient.name}</td>
                    {(roles?.includes(UserRole.ADMIN) || roles?.includes(UserRole.SUPER_ADMIN)) && (
                      <td className="border py-2 px-3 text-sm">{row?.patient?.hospital?.name || "---"}</td>
                    )}
                    <td className="border py-2 px-3 text-sm min-w-[120px]">{row?.refNumber}</td>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <td className="border py-2 px-3 text-sm min-w-[200px] cursor-pointer">
                            <span className="truncate block max-w-[200px]">
                              {row?.description?.length > 30
                                ? row?.description.slice(0, 30) + "..."
                                : row?.description}
                            </span>
                          </td>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs break-words">
                          {row?.description}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <td className="border py-2 px-3 text-sm whitespace-nowrap">{STATUS_LABELS[row.status]}</td>
                    <td className="border py-2 px-3 text-sm whitespace-nowrap">{format(new Date(row.updatedAt), "yyyy/MM/dd")}</td>
                    {/* <td className="border py-2 px-3 text-sm">{row?.doctorName}</td> */}
                    {/* <td className="border py-2 px-3 text-sm">{row?.isPreAuth ? "True" : "False"}</td> */}
                    {(roles?.includes(UserRole.ADMIN) || roles?.includes(UserRole.SUPER_ADMIN)) && (
                      <td className="border py-2 px-3 text-sm">
                        <AssigneeDropdown
                          claimId={row?.refNumber}
                          currentAssignee={row?.assignee?.id}
                          users={users}
                          onUpdate={(id, newAssignee) => {
                            if (newAssignee) {
                              setIsClaimAssigned(true);
                              setAssignedClaimRefNumber(row.refNumber);
                            }
                            setClaims((prev) =>
                              prev.map((c) => (c.id === id ? { ...c, assignee: newAssignee } : c))
                            );
                          }}
                        />
                      </td>
                    )}
                    <td className="border py-2 px-3 text-sm">
                      <div className="flex gap-2 text-muted-foreground items-center justify-center">
                        <Link href={`/newClaim/${row?.refNumber}`}>
                          <Pencil className="w-4 h-4 hover:text-green-600 cursor-pointer" />
                        </Link>
                        {row?.status == StatusType.DRAFT && (
                          <Trash2
                            onClick={() => handleDeleteClaim(row.refNumber)}
                            className="w-4 h-4 hover:text-red-600 cursor-pointer"
                          />
                        )}
                        {row?.status !== StatusType.DRAFT && (
                          <>
                            {(row.assignee !== null ||
                              (isClaimAssigned && assignedClaimRefNumber === row.refNumber)) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="relative"
                                onClick={async () => {
                                  await eyeTap(roles, row?.id);
                                  window.location.assign(`/claims/${row?.refNumber}`);
                                }}
                              >
                                <Eye size={20} className="text-[#3E79D6]" />
                                {commentsCountMap[row?.id] > 0 && (
                                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {commentsCountMap[row?.id]}
                                  </span>
                                )}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        {data?.length == 0 && (
          <div className="text-center w-full flex justify-center items-center" style={{ height: "calc(100% - 50px)" }}>
            No record found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page <= 1}
          className="px-4 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= total}
          className="px-4 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}