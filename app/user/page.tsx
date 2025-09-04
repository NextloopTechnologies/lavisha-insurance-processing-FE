"use client";
import CreateUser from "@/components/CreateUser";
import { DataTable } from "@/components/DataTable";
import SidebarLayout from "@/components/SidebarLayout";
import { getClaims } from "@/services/claims";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { getUsers } from "@/services/users";
import { UserTable } from "@/components/UserTable";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function User() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const roles = Cookies.get("user_role")?.split(",") || []; // supports multiple roles

  const searchParams = useSearchParams();
  const patientNameFromQuery = searchParams.get("patientName");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      if (res?.status === 200) {
        setLoading(false);
        setUsers(res?.data?.data);
        setTotal(Math.ceil(res.data.total / pageSize));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
          // handleDeleteClaim={handleDeleteClaim}
          // getSearchData={getSearchData}
          initialSearchTerm={patientNameFromQuery}
          roles={roles}
        />
        <CreateUser />
      </div>
    </SidebarLayout>
  );
}
