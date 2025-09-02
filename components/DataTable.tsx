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
  assignee?: { id: string };
  patient: {
    id?: string;
    name?: string;
  };
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
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const router = useRouter();
  const [isClaimAssigned, setIsClaimAssigned] = useState<boolean>(false);
  const [assignedClaimRefNumber, setAssignedClaimRefNumber] = useState<string>("");

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      return prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status];
    });
  };
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm); // shows in input
      setDebouncedSearchTerm(initialSearchTerm);
      getSearchData(initialSearchTerm, "debouncedSearchTerm"); // triggers search
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    if (selectedStatuses?.length > 0) {
      getSearchData(selectedStatuses, "selectedStatuses");
    }
  }, [selectedStatuses]);
  useEffect(() => {
    if (selectedDate) {
      getSearchData(selectedDate, "selectedDate");
    }
  }, [selectedDate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      getSearchData(searchTerm, "debouncedSearchTerm");
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler); // Cleanup if user keeps typing
    };
  }, [searchTerm]);

  const totalPages = Math.ceil(total);

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
          <MultiSelect
            mode="multi"
            selectedStatuses={selectedStatuses}
            status={statusOptions}
            toggleStatus={toggleStatus}
            setSelectedStatuses={setSelectedStatuses}
          />
          <DatePicker date={selectedDate} onChange={setSelectedDate} />
        </div>
        {(!roles.includes("ADMIN") || !roles.includes("SUPER_ADMIN")) && (
          <Button
            onClick={() => router.push("/newClaim")}
            className="bg-[#3E79D6] hover:bg-[#3E79D6] text-white rounded-sm hidden md:flex cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" /> New Claim
          </Button>
        )}
        <Plus
          onClick={() => router.push("/newClaim")}
          className="mr-2 h-4 w-4 block md:hidden cursor-pointer"
        />
      </div>

      {/* Table */}
      <div className="  overflow-x-auto">
        <div className="overflow-y-auto rounded-sm bg-white border h-[calc(100vh-300px)] md:h-[calc(100vh-210px)]">
          <Table className="min-w-full ">
            <TableHeader className="text-red-400  w-full">
              <TableRow className="bg-white text-[#FBBC05]">
                {/* <div className="rounded-md border  w-20"> */}
                {/* <TableHead className="text-[#FBBC05] border p-3">S No.</TableHead> */}
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Patient Name
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Claim ID
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
                <TableHead className="text-center text-[#FFFF] bg-[#3E79D6] border p-3">
                  Action
                </TableHead>
                {/* </div> */}
              </TableRow>
            </TableHeader>
            {/* <br /> */}
            <div className="mb-2 block"></div>
            <TableBody className="bg-white">
              {data?.length
                ? data?.map((row, index) => (
                    <TableRow key={index} className="">
                      {/* <TableCell className=" border p-3">{row.id}</TableCell> */}

                      <TableCell className=" border p-5">
                        {row?.patient.name}
                      </TableCell>
                      <TableCell className=" border p-5 md:w-32 min-w-[120px]">
                        {row?.refNumber}
                      </TableCell>
                      <TableCell className=" border p-5 md:w-48 min-w-[250px] ">
                        {row?.description}
                      </TableCell>
                      {!roles?.includes("ADMIN") && (
                        <TableCell className=" border p-5 ">
                          {STATUS_LABELS[row.status]}
                        </TableCell>
                      )}
                      <TableCell className=" border p-5 ">
                        {format(new Date(row.createdAt), "yyyy/MM/dd")}
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
                          {/* {row?.assignee || "---"} */}
                          <AssigneeDropdown
                            claimId={row?.refNumber}
                            currentAssignee={row?.assignee?.id}
                            users={users} // pass list of users to assign
                            onUpdate={(id, newAssignee) => {
                              // conditional visibility for view option in action
                              if(newAssignee) {
                                setIsClaimAssigned(true)
                                setAssignedClaimRefNumber(row.refNumber)
                              }
                              setClaims((prev) =>
                                prev.map((c) =>
                                  c.id === id
                                    ? { ...c, assignee: newAssignee }
                                    : c
                                )
                              );
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell className=" border p-5">
                        <div className="flex gap-2 justify-start text-muted-foreground">
                          {/* {!roles?.includes("ADMIN") && ( */}
                          <Link href={`/newClaim/${row?.refNumber}`}>
                            <Pencil className="w-4 h-4 hover:text-green-600 cursor-pointer" />
                          </Link>
                          {/* )} */}
                          {row?.status == StatusType.DRAFT && (
                            <Trash2
                              onClick={() => handleDeleteClaim(row.refNumber)}
                              className="w-4 h-4 hover:text-red-600 cursor-pointer"
                            />
                          )}
                          {row?.status !== StatusType.DRAFT && (
                            <>
                              {/* {roles?.includes("ADMIN") ? (
                                <Link
                                  href={`/claims/${row?.refNumber}?showStatus=true&tab=5`}
                                >
                                  <Eye
                                    // onClick={() => row.patient.id}
                                    className="w-4 h-4 hover:text-blue-600 cursor-pointer"
                                  />
                                </Link>
                              ) : ( */}
                              {(row.assignee!==null || (isClaimAssigned && assignedClaimRefNumber===row.refNumber)) && (
                                <Link href={`/claims/${row?.refNumber}`}>
                                  <Eye
                                    // onClick={() => row.patient.id}
                                    className="w-4 h-4 hover:text-blue-600 cursor-pointer"
                                  />
                                </Link>
                              )}
                              {/* )} */}
                              {/* {!roles?.includes("ADMIN") && ( */}
                              <Copy className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                              {/* )} */}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
