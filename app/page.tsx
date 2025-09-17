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
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);

    return { from, to };
  });
  const [selectHospital, setSelectHospital] = useState(" ");
  const handleHospitalChange = (value: string) => {
    setSelectHospital(value);
  };

  const roles = Cookies.get("user_role")?.split(",") || []; // supports multiple roles

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedInUserName(localStorage.getItem("userName"));
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await getDashboardByDate(
        dateRange.from,
        dateRange.to,
        selectHospital
      );
      if (res?.status === 200) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, selectHospital]);
  const hospitalStatCardData = [
    {
      value: (dashboardData.averageSettlementPercentage ?? 0) + '%',
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
      value: dashboardData?.monthlyClaims ?? 0,
      label: "Monthly Claims",
    },
    {
      value: dashboardData?.totalSettlements ?? 0,
      label: "Monthly Settlements",
    },
    {
      value: dashboardData?.totalPatients ?? 0,
      label: "Total Patients",
    },
  ];

  return (
    <SidebarLayout>
      <div className="relative  p-6 space-y-6 h-[calc(100vh-100px)] overflow-y-scroll">
        {(roles?.includes("ADMIN") || roles?.includes("SUPER_ADMIN")) && (
          <AdminDashboard
            dashboardData={dashboardData}
            loggedInUserName={loggedInUserName}
            dateRange={dateRange}
            setDateRange={setDateRange}
            statCardData={adminStatCardData}
            hospitalFilter={true}
            roles={roles}
            handleHospitalChange={handleHospitalChange}
            selectHospital={selectHospital}
          />
        )}
        {(roles?.includes("HOSPITAL") ||
          roles?.includes("HOSPITAL_MANAGER")) && (
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
