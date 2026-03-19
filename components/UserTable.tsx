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
import { STATUS_LABELS } from "@/lib/utils";
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
const Role = {
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  HOSPITAL: "Hospital",
  HOSPITAL_MANAGER: "Hospital Manager",
};

type DATA = {
  id?: string;
  name?: string;
  email?: string;
  address?: string;
  hospital?: {
    id?: string;
    name?: string;
  };
  role: string;
};

export function UserTable({
  data,
  sortByClaim,
  page,
  setPage,
  total,
  handleDeleteClaim,
  getSearchData,
  initialSearchTerm = "",
  roles,
  handlegetUser,
  setOpenDialog,
}: {
  roles?: string[];
  data: DATA[];
  sortByClaim: any;
  page: number;
  setPage: any;
  total: number;
  handleDeleteClaim?: any;
  getSearchData?: (value?: string[] | string | Date, name?: string) => void;
  initialSearchTerm?: string;
  handlegetUser?: (id?: string) => void;
  setOpenDialog?: any;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const router = useRouter();

  const totalPages = Math.ceil(total);

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

  return (
    <div className="min-h-[calc(100vh-265px)] p-4">
      {/* Top bar */}

      <div className=" flex flex-wrap gap-4 justify-between items-center mb-4">
        <div className="flex md:min-w-full gap-2 justify-between items-center ">
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
          <div className="">
            <Button
              onClick={() => setOpenDialog(true)}
              className="bg-[#3E79D6] hover:bg-[#3E79D6] text-white rounded-sm hidden md:flex cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" /> Create User
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="overflow-y-auto rounded-sm bg-white border h-[calc(100vh-100px)] md:h-[calc(100vh-210px)]">
          <Table className="min-w-full ">
            <TableHeader className="text-red-400  w-full">
              <TableRow className="bg-white text-[#FBBC05]">
                {/* <div className="rounded-md border  w-20"> */}
                {/* <TableHead className="text-[#FBBC05] border p-3">S No.</TableHead> */}
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Name
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3">
                  Email
                </TableHead>
                {roles.includes(UserRole.HOSPITAL) && (
                  <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                    Address
                  </TableHead>
                )}{" "}
                {roles.includes(UserRole.HOSPITAL_MANAGER) && (
                  <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                    Hospital Name
                  </TableHead>
                )}
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Role
                </TableHead>
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
                    <TableRow key={index + "_" + row?.name} className="">
                      {/* <TableCell className=" border p-3">{row.id}</TableCell> */}

                      <TableCell className=" border p-5">{row?.name}</TableCell>
                      <TableCell className=" border p-5 md:w-32 min-w-[120px]">
                        {row?.email}
                      </TableCell>
                      {roles.includes(UserRole.HOSPITAL) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TableCell className="border p-5 md:w-48 min-w-[200px] cursor-pointer">
                                <span className="truncate block max-w-[190px] ">
                                  {row?.address?.length > 30
                                    ? row?.address.slice(0, 30) + "..."
                                    : row?.address}
                                </span>
                              </TableCell>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs break-words">
                              {row?.address}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {roles.includes(UserRole.HOSPITAL_MANAGER) && (
                        <TableCell className=" border p-5 md:w-48 min-w-[250px] ">
                          {row?.hospital?.name}
                        </TableCell>
                      )}

                      <TableCell className=" border p-5 md:w-48 min-w-[250px] ">
                        {Role[row?.role]}
                      </TableCell>

                      <TableCell className=" border p-5">
                        <div className="flex gap-2 justify-start text-muted-foreground">
                          {/* <Eye
                            className="w-4 h-4 hover:text-blue-600 cursor-pointer"
                          /> */}
                          {/* <Link href={`/user/${row?.id}`}> */}
                          <Pencil
                            onClick={() => handlegetUser(row?.id)}
                            className="w-4 h-4 hover:text-green-600 cursor-pointer"
                          />
                          {/* </Link> */}
                          {Role[row?.role] !== "Super Admin" && (
                            <Trash2
                              onClick={() => handleDeleteClaim(row.id)}
                              className="w-4 h-4 hover:text-red-600 cursor-pointer"
                            />
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
