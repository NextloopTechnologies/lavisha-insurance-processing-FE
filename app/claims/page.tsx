"use client";
import { DataTable } from "@/components/DataTable";
import SidebarLayout from "@/components/SidebarLayout";
import { getClaims } from "@/services/claims";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Claims() {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await getClaims();
      setClaims(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch claims:", err);
    }
  };
  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <SidebarLayout>
      <div className="bg-gray-100">
        <DataTable data={claims} />
      </div>
    </SidebarLayout>
  );
}
