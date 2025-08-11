"use client";
import CreateUser from "@/components/CreateUser";
import { DataTable } from "@/components/DataTable";
import SidebarLayout from "@/components/SidebarLayout";
import { getClaims } from "@/services/claims";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function User() {

  return (
    <SidebarLayout>
      <div className="bg-gray-100">
        <CreateUser/>
      </div>
    </SidebarLayout>
  );
}
