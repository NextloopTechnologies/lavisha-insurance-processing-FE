"use client";
import { DataTable } from "@/components/DataTable";
import DeletePopup from "@/components/DeletePopup";
import LoadingOverlay from "@/components/LoadingOverlay";
import SidebarLayout from "@/components/SidebarLayout";
import {
  deleteClaims,
  getClaims,
  getClaimsById,
  getClaimsByParams,
} from "@/services/claims";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { formatRaisedDate } from "@/lib/utils";

export default function Claims() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const [page, setPage] = useState(1); // Starts from 1
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchData, setSearchData] = useState({
    selectedStatuses: [],
    selectedDate: "",
    debouncedSearchTerm: "",
  });
  const getSearchData = (value, name) => {
    setSearchData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const searchParams = useSearchParams();
  const id = searchParams.get("name");
  const sortByClaim = () => {};
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const query: any = {
        skip: (page - 1) * pageSize,
        take: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (searchData?.debouncedSearchTerm)
        query.patientName = searchData?.debouncedSearchTerm;
      if (searchData?.selectedStatuses.length > 0)
        query.status = searchData?.selectedStatuses.join(",");
      if (searchData?.selectedDate) {
        query.createdFrom = format(
          new Date(searchData?.selectedDate),
          "yyyy-MM-dd"
        );
      }

      const res = await getClaimsByParams(query);

      setClaims(res.data.data);
      const totalPages = Math.ceil(res?.data?.total / pageSize);
      setTotal(totalPages);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchClaims();
  }, [page, pageSize, searchData]);

  const handleDeleteClaim = (id: string) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setOpenDeleteDialog(false);
    const res = await deleteClaims(selectedId);
    if (res.status == 200) {
      fetchClaims();
    }
  };
  return (
    <SidebarLayout>
      {loading && <LoadingOverlay />}

      <div className="bg-gray-100">
        <DataTable
          data={claims}
          page={page}
          setPage={setPage}
          total={total}
          sortByClaim={sortByClaim}
          handleDeleteClaim={handleDeleteClaim}
          getSearchData={getSearchData}
        />

        <DeletePopup
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onConfirm={confirmDelete}
          title="Do you want to delete this Claim?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </SidebarLayout>
  );
}
