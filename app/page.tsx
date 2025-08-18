"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import SidebarLayout from "@/components/SidebarLayout";
import { getDashboardByDate } from "@/services/dashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

// import AdminDashboard from "@/components/AdminDashboard";
// import HospitalDashboard from "@/components/HospitalDashboard";

const Dashboard = () => {
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>([]);
  const [dateRange, setDateRange] = useState<any>({
    from: new Date("2025-06-01"),
    to: new Date("2025-07-30"),
  });

  const roles = Cookies.get("user_role")?.split(",") || []; // supports multiple roles

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedInUserName(localStorage.getItem("userName"));
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await getDashboardByDate(dateRange.from, dateRange.to);
      if (res?.status === 200) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);
  const hospitalStatCardData = [
    {
      value: "90%",
      label: "Average Settlement Amount %",
    },
    {
      value: dashboardData?.activeClaims ?? 0,
      label: "Active Claim",
    },
    {
      value: dashboardData?.totalPatients ?? 0,
      label: "Total Patients",
    },
  ];
  const adminStatCardData = [
    {
      value: "50",
      label: "Monthly Claims",
    },
    {
      value: 50,
      label: "Monthly Settlements",
    },
    {
      value: 100,
      label: "Total Patients",
    },
  ];

  return (
    <SidebarLayout>
      <div className="relative  p-6 space-y-6 h-[calc(100vh-100px)] overflow-y-scroll">
        {roles.includes("ADMIN") && (
          <AdminDashboard
            dashboardData={dashboardData}
            loggedInUserName={loggedInUserName}
            dateRange={dateRange}
            setDateRange={setDateRange}
            statCardData={adminStatCardData}
            hospitalFilter={true}
            roles={roles}
          />
        )}
        {roles.includes("HOSPITAL") && (
          <AdminDashboard
            dashboardData={dashboardData}
            loggedInUserName={loggedInUserName}
            dateRange={dateRange}
            setDateRange={setDateRange}
            statCardData={hospitalStatCardData}
            roles={roles}
          />
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
