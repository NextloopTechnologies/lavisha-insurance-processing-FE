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
import { useMemo, useState } from "react";
import { MultiSelect } from "./MultiSelect";
import Link from "next/link";
import { statusOptions } from "@/constants/menu";
import { StatusType } from "@/types/claims";

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
  patient: {
    id?: string;
    name?: string;
  };
};

const users: User[] = [
  {
    id: 1,
    patientName: "Hemant Rajput",
    description: "Description",
    status: "Pending",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
  {
    id: 2,
    patientName: "Md Nizam",
    description: "Description",
    status: "Pending",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
  {
    id: 3,
    patientName: "Hemant Rajput",
    description: "Description",
    status: "Pending",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
  {
    id: 4,
    patientName: "Hemant Rajput",
    description: "Description",
    status: "Pending",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
  {
    id: 5,
    patientName: "Sanad Khan",
    description: "Description",
    status: "Pending",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
  {
    id: 6,
    patientName: "Hemant Rajput",
    description: "Description",
    status: "Queried",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
  {
    id: 7,
    patientName: "Vaibhav Kharode",
    description: "Description",
    status: "Draft",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
];

export function DataTable({ data }: { data: DATA[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const router = useRouter();
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };
  const itemsPerPage = 10;
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // const matchesStatus =
      //   statusFilter === "All" || row.status === statusFilter;
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses
          ?.toString()
          .toLowerCase()
          .includes(row.status?.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatuses, statusFilter, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                setCurrentPage(1); // reset to page 1 when filtering
              }}
            />
            <span className="absolute left-3 top-2.5 text-yellow-500">
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
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Status
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Created Date
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Dr. Name
                </TableHead>
                <TableHead className="text-[#FFFF] bg-[#3E79D6] border p-3 ">
                  Pre-Auth Status
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
              {paginatedData.map((row, index) => (
                <TableRow key={index} className="">
                  {/* <TableCell className=" border p-3">{row.id}</TableCell> */}

                  <TableCell className=" border p-5">
                    {row.patient.name}
                  </TableCell>
                  <TableCell className=" border p-5 md:w-32 min-w-[120px]">
                    {row.refNumber}
                  </TableCell>
                  <TableCell className=" border p-5 md:w-48 min-w-[250px] ">
                    {row.description}
                  </TableCell>
                  <TableCell className=" border p-5 ">{row.status}</TableCell>
                  <TableCell className=" border p-5 ">
                    {row.createdAt}
                  </TableCell>
                  <TableCell className=" border p-5 ">
                    {row.doctorName}
                  </TableCell>
                  <TableCell className=" border p-5 ">
                    {row.isPreAuth ? "True" : "False"}
                  </TableCell>
                  <TableCell className=" border p-5">
                    <div className="flex gap-2 justify-center text-muted-foreground">
                      <Link href={`/claims/${row.refNumber}`}>
                        <Pencil className="w-4 h-4 hover:text-green-600 cursor-pointer" />
                      </Link>
                      <Trash2 className="w-4 h-4 hover:text-red-600 cursor-pointer" />
                      {row.status!==StatusType.DRAFT && (
                        <>
                          <Link href={`/claims/${row.refNumber}`}>
                          <Eye
                            // onClick={() => row.patient.id}
                            className="w-4 h-4 hover:text-blue-600 cursor-pointer"
                            />
                          </Link>
                          <Copy className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
