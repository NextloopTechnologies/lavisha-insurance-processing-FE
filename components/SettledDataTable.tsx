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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
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
import { STATUS_LABELS, filterTabsByData, statusMaxIndexMap } from "@/lib/utils"; // ✅ added imports
import { UserRole } from "@/types/comments";
import { getClaimsById } from "@/services/claims";

//  Added allTabLabels constant
const allTabLabels = [
  "Details",
  "Comments/History",
  "Queried",
  "Enhancement",
  "Discharge",
  "Settlement",
];

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
  description?: string;
  claimId: string;
  refNumber?: string;
  isPreAuth: string;
  tpaName?: string;
  insuranceCompany?: string;
  assignee?: {
    id?: string;
    name?: string;
  };
  patient: {
    id?: string;
    name?: string;
    hospital: {
      id?: string;
      name?: string;
    };
  };
  totalBill?: string;
  totalApproval?: string;
  settlementAmount?: string;
  tds?: string;
  deduction?: string;
  updatedSettlementDate?: string;
  settlementDate?: string;
};

export function SettledDataTable({
  data,
  sortByClaim,
  page,
  setPage,
  total,
  handleDeleteClaim,
  getSearchData,
  initialSearchTerm = "",
  roles,
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
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "SETTLED",
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [assignee, setAssignee] = useState("");
  const router = useRouter();
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      return prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status];
    });
  };
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      setDebouncedSearchTerm(initialSearchTerm);
      getSearchData(initialSearchTerm, "debouncedSearchTerm");
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    if (selectedStatuses?.length > 0) {
      setPage(1);
      getSearchData(selectedStatuses, "selectedStatuses");
    }
  }, [selectedStatuses]);

  useEffect(() => {
    if (selectedDate) {
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

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const totalPages = Math.ceil(total);
  const handleChange = (name, value) => {};
  
  return (
    <div className="min-h-[calc(100vh-75px)] p-4">
      {/* Top bar */}
      <div className=" flex flex-wrap gap-4 justify-between items-center mb-4">
        <div className="flex gap-2 md:flex-wrap">
          <div className="relative">
            <Input
              placeholder="Search here"
              className="pl-10 w-[180px] md:w-56 bg-white rounded-4xl"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
            <span className="absolute left-3 top-2.5 text-[#3E79D6]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
              </svg>
            </span>
          </div>
        </div>

        <Button
          onClick={() => router.push("/newClaim")}
          className="bg-[#3E79D6] hover:bg-[#3E79D6] text-white rounded-sm hidden md:flex cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> New Claim
        </Button>
        <Plus
          onClick={() => router.push("/newClaim")}
          className="mr-2 h-4 w-4 block md:hidden cursor-pointer"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="overflow-y-auto rounded-sm bg-white border h-[calc(100vh-300px)] md:h-[calc(100vh-210px)]">
          <Table className="min-w-full">
            <TableHeader className="text-red-400 w-full">
              <TableRow className="bg-white text-[#FBBC05]">
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Patient Name
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Claim ID
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Hospital Name
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Description
                </TableHead>
                {(!roles?.includes(UserRole.ADMIN) ||
                  !roles?.includes(UserRole.SUPER_ADMIN)) && (
                    <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                      Status
                    </TableHead>
                  )}
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Created Date
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Dr. Name
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Pre-Auth Status
                </TableHead>
                {(roles?.includes(UserRole.ADMIN) ||
                  roles?.includes(UserRole.SUPER_ADMIN)) && (
                    <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                      Assingee
                    </TableHead>
                  )}
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Total Bill
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Total Approval
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Total Settled Amount
                </TableHead>
                <TableHead className="text-center text-[#FFFF] bg-[#3E79D6] border p-3">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <div className="mb-2 block"></div>
            <TableBody className="bg-white">
              {data?.length
                ? data?.map((row, index) => { //  changed arrow to block body
                  const maxIndex = statusMaxIndexMap[row?.status] ?? allTabLabels.length - 1;
                  const visibleTabs = filterTabsByData(
                    allTabLabels.slice(0, maxIndex + 1),
                    {
                      queries: [1],        //  fake non-empty array → Queried tab shows
                      enhancements: [1],   //  fake non-empty array → Enhancement tab shows
                    }
                  );
                  
                  const getSettlementTabIndex = async (refNumber: string) => {
                    try {
                      const res = await getClaimsById(refNumber);
                      if (res?.status !== 200) return 5; // fallback

                      const claimData = res.data;
                      const maxIndex = statusMaxIndexMap[claimData?.status] ?? allTabLabels.length - 1;
                      const visibleTabs = filterTabsByData(
                        allTabLabels.slice(0, maxIndex + 1),
                        claimData
                      );
                      return visibleTabs.findIndex((label) => label === "Settlement");
                    } catch {
                      return 5; // fallback
                    }
                  };

                  return ( //  explicit return
                    <TableRow
                      key={index + "_" + row?.patient.name}
                      className=""
                    >
                      <TableCell className=" border p-5">
                        {row?.patient.name}
                      </TableCell>
                      <TableCell className=" border p-5 md:w-32 min-w-[120px]">
                        {row?.refNumber}
                      </TableCell>
                      <TableCell className=" border p-5 md:w-32 min-w-[120px]">
                        {row?.patient?.hospital?.name}
                      </TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableCell className="border p-5 md:w-48 min-w-[250px] cursor-pointer">
                              <span className="truncate block max-w-[200px] ">
                                {row?.description?.length > 30
                                  ? row?.description.slice(0, 30) + "..."
                                  : row?.description}
                              </span>
                            </TableCell>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs break-words">
                            {row?.description}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {(!roles?.includes(UserRole.ADMIN) ||
                        !roles?.includes(UserRole.SUPER_ADMIN)) && (
                          <TableCell className=" border p-5 ">
                            {STATUS_LABELS[row.status]}
                          </TableCell>
                        )}
                      <TableCell className=" border p-5 ">
                        {format(new Date(row?.settlementDate), "yyyy/MM/dd")}
                      </TableCell>
                      <TableCell className=" border p-5 ">
                        {row?.doctorName}
                      </TableCell>
                      <TableCell className=" border p-5 ">
                        {row?.isPreAuth ? "True" : "False"}
                      </TableCell>
                      {(roles?.includes(UserRole.ADMIN) ||
                        roles?.includes(UserRole.SUPER_ADMIN)) && (
                          <TableCell className=" border p-5 ">
                            {row?.assignee?.name || "---"}
                          </TableCell>
                        )}
                      <TableCell className="border p-5">
                        {row?.totalBill}
                      </TableCell>
                      <TableCell className="border p-5">
                        {row?.totalApproval}
                      </TableCell>
                      <TableCell className="border p-5">
                        {row?.settlementAmount}
                      </TableCell>
                      <TableCell className=" border p-5">
                        <div className="flex gap-2 justify-start text-muted-foreground">
                          {!roles?.includes(UserRole.ADMIN) && (
                            <Link href={`/newClaim/${row?.refNumber}`}>
                              <Pencil className="w-4 h-4 hover:text-green-600 cursor-pointer" />
                            </Link>
                          )}
                          {row?.status !== StatusType.DRAFT && (
                            <>
                              {/* {roles?.includes(UserRole.ADMIN) ? (
                                  <Link
                                    href={`/claims/${row?.refNumber}?showStatus=true&tab=${tabIndex}`} // ✅ dynamic tab index
                                  >
                                    <Eye className="w-4 h-4 hover:text-blue-600 cursor-pointer" />
                                  </Link>
                                ) : (
                                  <Link href={`/claims/${row?.refNumber}`}>
                                    <Eye className="w-4 h-4 hover:text-blue-600 cursor-pointer" />
                                  </Link>
                                )} */}
                              {roles?.includes(UserRole.ADMIN) ? (
                                <button
                                  onClick={async () => {
                                    const tabIndex = await getSettlementTabIndex(row?.refNumber);
                                    router.push(`/claims/${row?.refNumber}?showStatus=true&tab=${tabIndex}`);
                                  }}
                                >
                                  <Eye className="w-4 h-4 hover:text-blue-600 cursor-pointer" />
                                </button>
                              ) : (
                                <Link href={`/claims/${row?.refNumber}`}>
                                  <Eye className="w-4 h-4 hover:text-blue-600 cursor-pointer" />
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
                : ""}
            </TableBody>
          </Table>
          {data?.length == 0 ? (
            <div className="text-center w-full flex justify-center items-center h-[calc(100%-300px)] md:h-[calc(100%-210px)]">
              No record found
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setPage((prev) => Math.max(prev - 1, 1));
            }}
            disabled={page > 1 ? false : true}
            className="px-4 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => {
              setPage((prev) => prev + 1);
            }}
            disabled={page < total ? false : true}
            className="px-4 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}