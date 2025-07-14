import { DataTable } from "@/components/DataTable";
import SidebarLayout from "@/components/SidebarLayout";
import Image from "next/image";

export default function Patients() {
  return (
    <SidebarLayout>
      <DataTable />
    </SidebarLayout>
  );
}
