import { DataTable } from "@/components/DataTable";
import SidebarLayout from "@/components/SidebarLayout";
import Image from "next/image";

export default function Claims() {
  return (
    <SidebarLayout>
      <div className="bg-gray-100">
        <DataTable />
      </div>
    </SidebarLayout>
  );
}
