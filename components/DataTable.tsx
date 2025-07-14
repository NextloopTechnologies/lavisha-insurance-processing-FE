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

import { Plus, Eye, Pencil, Trash2, Copy } from "lucide-react";
import { useMemo, useState } from "react";

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
    status: "Pending",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
  {
    id: 7,
    patientName: "Vaibhav Kharode",
    description: "Description",
    status: "Pending",
    claimId: "ID25325871",
    createdDate: "10/11/2025",
    doctor: "Dr. Rajesh panda",
    preAuthStatus: "........",
  },
];


export function DataTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = useMemo(() => {
    return users.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-[calc(100vh-75px)] p-4">
      {/* Top bar */}
      <div className=" flex flex-wrap gap-4 justify-between items-center mb-4">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Input
              placeholder="Search here..."
              className="pl-10 w-56 bg-white rounded-4xl"
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

          <Select>
            <SelectTrigger className="w-[130px] bg-white rounded-4xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <span>icon Pending</span>
              </SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[150px] bg-white rounded-4xl">
              <SelectValue placeholder="Created Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-[#FBBC05] hover:bg-[#fbbd05ea] text-white rounded-sm">
          <Plus className="mr-2 h-4 w-4" /> New Claim
        </Button>
      </div>

      {/* Table */}
      <div className="  overflow-x-auto">
        <Table className="">
          <TableHeader className="text-red-400  w-full ">
            <TableRow className="bg-white text-[#FBBC05]">
              {/* <div className="rounded-md border  w-20"> */}
              {/* <TableHead className="text-[#FBBC05] border p-3">S No.</TableHead> */}
              <TableHead className="text-[#FBBC05] border p-3">
                Patient Name
              </TableHead>
              <TableHead className="text-[#FBBC05] border p-3">
                Description
              </TableHead>
              <TableHead className="text-[#FBBC05] border p-3">
                Status
              </TableHead>
              <TableHead className="text-[#FBBC05] border p-3">
                Claim ID
              </TableHead>
              <TableHead className="text-[#FBBC05] border p-3">
                Created Date
              </TableHead>
              <TableHead className="text-[#FBBC05] border p-3">
                Dr. Name
              </TableHead>
              <TableHead className="text-[#FBBC05] border p-3">
                Pre-Auth Status
              </TableHead>
              <TableHead className="text-center text-[#FBBC05] border p-3">
                Action
              </TableHead>
              {/* </div> */}
            </TableRow>
          </TableHeader>
          {/* <br /> */}
          <div className="mb-2 block"></div>
          {/* <div className="rounded-md border w-full"> */}
          <TableBody className="bg-white">
            {paginatedData.map((row, index) => (
              <TableRow key={index} className="">
                {/* <TableCell className=" border p-3">{row.id}</TableCell> */}

                <TableCell className=" border p-3">{row.patientName}</TableCell>
                <TableCell className=" border p-3">{row.description}</TableCell>
                <TableCell className=" border p-3">{row.status}</TableCell>
                <TableCell className=" border p-3">{row.claimId}</TableCell>
                <TableCell className=" border p-3">{row.createdDate}</TableCell>
                <TableCell className=" border p-3">{row.doctor}</TableCell>
                <TableCell className=" border p-3">
                  {row.preAuthStatus}
                </TableCell>
                <TableCell className=" border p-3">
                  <div className="flex gap-2 justify-center text-muted-foreground">
                    <Eye className="w-4 h-4 hover:text-blue-600 cursor-pointer" />
                    <Pencil className="w-4 h-4 hover:text-green-600 cursor-pointer" />
                    <Trash2 className="w-4 h-4 hover:text-red-600 cursor-pointer" />
                    <Copy className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* </div> */}
        </Table>
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
