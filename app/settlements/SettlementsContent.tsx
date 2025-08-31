"use client";

import { DataTable } from "@/components/DataTable";
import DeletePopup from "@/components/DeletePopup";
import LoadingOverlay from "@/components/LoadingOverlay";
import SidebarLayout from "@/components/SidebarLayout";
import { deleteClaims, getClaimsByParams } from "@/services/claims";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { SettledDataTable } from "@/components/SettledDataTable";

export default function SettlementsContent() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchData, setSearchData] = useState({
    selectedStatuses: ["SETTLED"],
    selectedDate: "",
    debouncedSearchTerm: "",
  });

  const getSearchData = (value, name) => {
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };
  const roles = Cookies.get("user_role")?.split(",") || []; // supports multiple roles

  const searchParams = useSearchParams();
  const patientNameFromQuery = searchParams.get("patientName");

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const query: any = {
        skip: (page - 1) * pageSize,
        take: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (searchData.debouncedSearchTerm) {
        query.patientName = searchData.debouncedSearchTerm;
      }
      if (searchData.selectedStatuses.length > 0) {
        query.status = searchData.selectedStatuses.join(",");
      }
      if (searchData.selectedDate) {
        query.createdFrom = format(
          new Date(searchData.selectedDate),
          "yyyy-MM-dd"
        );
      }

      const res = await getClaimsByParams(query);
      if (res?.status === 200) {
        setClaims(res.data.data);
        setTotal(Math.ceil(res.data.total / pageSize));
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientNameFromQuery) {
      setSearchData((prev) => ({
        ...prev,
        debouncedSearchTerm: patientNameFromQuery,
      }));
    }
  }, [patientNameFromQuery]);

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
    if (res?.status === 200) {
      fetchClaims();
    }
  };

  return (
    <SidebarLayout>
      {loading && <LoadingOverlay />}
      <div className="bg-gray-100">
        <SettledDataTable
          data={claims}
          page={page}
          setPage={setPage}
          total={total}
          sortByClaim={() => {}}
          handleDeleteClaim={handleDeleteClaim}
          getSearchData={getSearchData}
          initialSearchTerm={patientNameFromQuery}
          roles={roles}
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
