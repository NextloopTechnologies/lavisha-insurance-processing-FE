"use client";
import SidebarLayout from "@/components/SidebarLayout";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import DeletePopup from "@/components/DeletePopup";
import { useEffect, useMemo, useRef, useState } from "react";
import PatientFormDialog from "@/components/CreateEdit";
import {
  createPatient,
  deletePatient,
  getPatients,
  getPatientsByParams,
  updatePatient,
} from "@/services/patients";
import LoadingOverlay from "@/components/LoadingOverlay";
import Link from "next/link";
import Avtar from "@/components/Avtar";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import User from "../user/page";

export default function Patients() {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const router = useRouter();
  const [patients, setPatients] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // number of patients per request
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const handleDelete = (id: string) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    // perform deletion logic here
    setOpenDeleteDialog(false);
    const res = await deletePatient(selectedId);
    if (res?.status == 200) {
      fetchPatients();
    }
  };

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setOpenPatientDialog(true);
  };

  const handleEditPatient = (id) => {
    setOpenPatientDialog(true);
    setSelectedPatient(patients.filter((item) => item.id == id)?.[0]);
  };

  const handleSubmitPatient = async (payload) => {
    if (selectedPatient) {
      const { name, age, fileName, url } = payload;
      try {
        setLoading(true);
        const response = await updatePatient(
          { name, age, fileName, url },
          selectedPatient.id
        );
        fetchPatients();
      } catch (error: any) {
        setLoading(false);
        console.error(
          "Error creating patient:",
          error.response?.data || error.message
        );
      }
    } else {
      const { name, age, fileName, url } = payload;
      try {
        setLoading(true);
        const response = await createPatient({ name, age, fileName, url });
        // setPatients(response.data);
        fetchPatients();
      } catch (error: any) {
        setLoading(false);
        console.error(
          "Error creating patient:",
          error.response?.data || error.message
        );
      }
    }
  };

  const roles = Cookies.get("user_role")?.split(",") || []; // supports multiple roles

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler); // Cleanup if user keeps typing
    };
  }, [searchTerm]);

  const fetchPatients = async (pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      const query: any = {
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        sortOrder: "desc",
      };

      if (debouncedSearchTerm) query.name = debouncedSearchTerm;

      const res = await getPatientsByParams(query);
      if (res?.status === 200) {
        const newData = res.data.data;
        setPatients((prev) => (reset ? newData : [...prev, ...newData]));
        setHasMore(newData.length === pageSize); // if less than pageSize, no more data
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPatients(1, true);
  }, [debouncedSearchTerm]);

  const handleClaimView = (id: string) => {
    router.push(`/claims?name=${encodeURIComponent(id)}`);
  };

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loaderRef.current, hasMore, loading]);

  // fetch when page changes
  useEffect(() => {
    if (page > 1) fetchPatients(page);
  }, [page]);

  return (
    <SidebarLayout>
      <div className="h-[calc(100vh-80px)] bg-gray-100 p-6 overflow-y-scroll">
        {loading && <LoadingOverlay />}

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <Input
              placeholder="Search here"
              className="pl-10 w-56 bg-white rounded-4xl"
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
          <button
            onClick={handleCreatePatient}
            className="bg-[#3E79D6] text-white px-4 py-2 rounded-md hover:bg-[#3E79D6] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 " />
            <span className="hidden sm:block">New Patients</span>
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {patients?.length > 0 ? (
            patients?.map((patient, index) => (
              <div
                key={index}
                className="relative bg-white rounded-2xl shadow-md p-16 text-center"
              >
                {/* Edit/Delete */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Pencil
                    onClick={() => handleEditPatient(patient.id)}
                    className="w-4 h-4 text-gray-500 hover:text-blue-600 cursor-pointer"
                  />
                  {patient?.claimCount === 0 && (
                    <Trash2
                      onClick={() => handleDelete(patient.id)}
                      className="w-4 h-4 text-gray-500 hover:text-red-600 cursor-pointer"
                    />
                  )}
                </div>

                {/* Avatar */}
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-300 mb-4 text-center flex justify-center items-center overflow-hidden">
                  {patient.url ? (
                    <img
                      src={patient?.url}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-[50px] font-semibold text-[#3E79D6] ">
                      {patient.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Patient Info */}
                <div className="text-gray-800 font-semibold">
                  {patient.name}
                </div>
                <div className="text-gray-600 mb-10">
                  Age: {patient.age} year
                </div>

                {/* View Claims Button */}
                {/* <Link href={`/claims/${patient.id}`}> */}
                {patient.claimCount > 0 ? (
                  <button
                    onClick={() => {
                      const claimCount = patient.claimCount;
                      if (claimCount === 1) {
                        if (patient.isClaimStatusDraft) {
                          return router.push(
                            `/newClaim/${patient.singleClaimRefNumber}`
                          ); // for draft claims
                        }
                        router.push(`/claims/${patient.singleClaimRefNumber}`); // for single non draft claim
                      } else {
                        router.push(`/claims?patientName=${patient.name}`); // for multiple claims
                      }
                    }}
                    className="cursor-pointer mt-4 w-full absolute bottom-0 left-0 bg-[#3E79D6] text-white px-4 py-4 rounded-b-2xl hover:bg-[#3E79D6]"
                  >
                    {patient.isClaimStatusDraft ? "Edit Claim" : "View Claims"}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      router.push(`/newClaim?patientId=${patient.id}`)
                    }
                    className="cursor-pointer mt-4 w-full absolute bottom-0 left-0 bg-[#3E79D6] text-white px-4 py-4 rounded-b-2xl hover:bg-[#3E79D6]"
                  >
                    Add Claim
                  </button>
                )}
                {/* </Link> */}
              </div>
            ))
          ) : (
            <div></div>
          )}
        </div>
        {patients?.length == 0 ? (
          <div className="text-center w-full flex justify-center items-center h-[calc(100vh-300px)] md:h-[calc(100vh-210px)]">
            No record found
          </div>
        ) : (
          ""
        )}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-6">
            <span className="text-gray-500">Loading more...</span>
          </div>
        )}
        <PatientFormDialog
          open={openPatientDialog}
          onOpenChange={setOpenPatientDialog}
          onSubmit={handleSubmitPatient}
          defaultData={selectedPatient}
          isEditMode={!!selectedPatient}
        />
        <DeletePopup
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onConfirm={confirmDelete}
          title="Do you want to delete this Patient?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </SidebarLayout>
  );
}
