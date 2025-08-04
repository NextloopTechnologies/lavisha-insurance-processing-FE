"use client";
import { DataTable } from "@/components/DataTable";
import DeletePopup from "@/components/DeletePopup";
import LoadingOverlay from "@/components/LoadingOverlay";
import SidebarLayout from "@/components/SidebarLayout";
import { deleteClaims, getClaims, getClaimsByParams } from "@/services/claims";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Claims() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const [page, setPage] = useState(1); // Starts from 1
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortByClaim = () => {};
  const fetchClaims = async () => {
    setLoading(true);
    try {
      // getClaimsByParams
      const res = await getClaimsByParams({
        skip: (page - 1) * pageSize,
        take: pageSize,
        sortBy: "createdAt",
        // cursor: "last-uuid",
        sortOrder: "desc",
      });
      setClaims(res.data.data);
      const totalPages = Math.ceil(res?.data?.total / pageSize);
      setTotal(totalPages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch claims:", err);
    }
  };
  useEffect(() => {
    fetchClaims();
  }, [page, pageSize]);

  const handleDeleteClaim = (id: string) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    // perform deletion logic here
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
