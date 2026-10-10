"use client";
import SidebarLayout from "@/components/SidebarLayout";
import ClaimWorkspace from "@/components/ClaimWorkspace";

// Edit = the full claim workspace with the editable form in the Details tab
export default function EditClaimPage() {
  return (
    <SidebarLayout>
      <ClaimWorkspace editable />
    </SidebarLayout>
  );
}
