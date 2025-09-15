"use client";
import CreateUser from "@/components/CreateUser";
import { DataTable } from "@/components/DataTable";
import SidebarLayout from "@/components/SidebarLayout";
import { getClaims } from "@/services/claims";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import {
  deleteUsers,
  getUserById,
  getUsers,
  getUsersByParams,
} from "@/services/users";
import { UserTable } from "@/components/UserTable";
import LoadingOverlay from "@/components/LoadingOverlay";
import { format } from "date-fns";
import DeletePopup from "@/components/DeletePopup";
import CreateEditUser from "@/components/CreateEditUser";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UserTableContent() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [openDialoge, setOpenDialog] = useState(false);
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query: any = {
        skip: (page - 1) * pageSize,
        take: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (searchData.debouncedSearchTerm) {
        query.name = searchData.debouncedSearchTerm;
      }

      const res = await getUsersByParams(query);
      if (res?.status === 200) {
        setUsers(res.data.data);
        setTotal(Math.ceil(res.data.total / pageSize));
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, searchData]);

  const fetchUserById = async (id: string) => {
    setLoading(true);
    try {
      const res = await getUserById(id);
      if (res?.status === 200) {
        setUser(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchUserById(selectedId);
    }
  }, [selectedId]);

  const handleDeleteClaim = (id: string) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setOpenDeleteDialog(false);
    const res = await deleteUsers(selectedId);
    if (res?.status === 200) {
      fetchUsers();
    }
  };
  const handlegetUser = (id: string) => {
    setSelectedId(id);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUser(null);
  };
  return (
    <SidebarLayout>
      {loading && <LoadingOverlay />}
      <div className="h-[calc(100vh-80px)] bg-gray-100  overflow-y-auto">
       
        <UserTable
          data={users}
          page={page}
          setPage={setPage}
          total={total}
          sortByClaim={() => {}}
          handleDeleteClaim={handleDeleteClaim}
          handlegetUser={handlegetUser}
          getSearchData={getSearchData}
          //   initialSearchTerm={patientNameFromQuery}
          roles={roles}
          setOpenDialog={setOpenDialog}
        />
        <CreateEditUser
          open={openDialoge}
          onOpenChange={handleCloseDialog}
          isEditMode={user ? true : false}
        >
          <CreateUser userData={user} setUserData={setUser} setOpenDialog={setOpenDialog}
          
          />
        </CreateEditUser>
        <DeletePopup
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onConfirm={confirmDelete}
          title="Do you want to delete this user?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </SidebarLayout>
  );
}
