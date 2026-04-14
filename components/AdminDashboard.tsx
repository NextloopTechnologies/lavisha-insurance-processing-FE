"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PieCharts from "@/components/PieCharts";
import BarCharts from "@/components/BarCharts";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DasboardStatCard from "./DashboardStatCard";
import { getUsersDropdown } from "@/services/users";

interface Props {
  dashboardData: any;
  loggedInUserName: string | null;
  dateRange: any;
  setDateRange: any;
  statCardData?: { value: any; label: string }[];
  hospitalFilter?: boolean;
  roles?: string[];
  handleHospitalChange?: (e: any) => void;
  selectHospital?: string;
}
const ADMIN_CHART = {
  threeMonths: "Three Months",
  sixMonths: "Six Months",
  nineMonths: "Nine Months",
  oneYear: "One Year",
};

const AdminDashboard: React.FC<Props> = ({
  dashboardData,
  loggedInUserName,
  dateRange,
  setDateRange,
  statCardData,
  hospitalFilter = false,
  roles,
  handleHospitalChange,
  selectHospital,
}) => {
  const [users, setUsers] = useState([]);
  const fetchUsersDropdown = async () => {
    // setLoading(true);
    try {
      const res = await getUsersDropdown("HOSPITAL");
      if (res?.status === 200) {
        setUsers(res?.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersDropdown();
  }, []);

  let adminChartData = [
    { name: ADMIN_CHART.threeMonths, count: dashboardData.threeMonths },
    { name: ADMIN_CHART.sixMonths, count: dashboardData.sixMonths },
    { name: ADMIN_CHART.nineMonths, count: dashboardData.nineMonths },
    { name: ADMIN_CHART.oneYear, count: dashboardData.oneYear },
  ];
  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-[#474747] font-semibold text-lg">Dashboard</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {hospitalFilter && (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <Label className="text-sm font-bold text-muted-foreground whitespace-nowrap">
                All Hospital
              </Label>
              <Select
                value={selectHospital}
                onValueChange={handleHospitalChange}
                defaultValue=" "
              >
                <SelectTrigger className="w-full sm:w-[160px] md:w-[180px]">
                  <SelectValue placeholder="All Hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={" "}>All Hospital</SelectItem>
                    {users?.map((item, index) => (
                      <SelectItem key={index} value={item?.id}>
                        {item?.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="w-full sm:w-auto">
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-6 xl:gap-6">
        <Card className="xl:col-span-2 flex flex-row items-center justify-between gap-3 p-4 sm:p-5 overflow-hidden">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold truncate">
              Welcome!
            </h2>
            <p className="text-gray-600 text-sm sm:text-base truncate">
              {loggedInUserName}
            </p>
          </div>
          <img
            src="assets/doctor-hospital.svg"
            alt="doctor"
            className="h-14 sm:h-16 md:h-20 w-auto flex-shrink-0"
          />
        </Card>

        <Card className="xl:col-span-4 p-4 sm:p-5 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 h-full">
            {statCardData?.map((item, index) => (
              <DasboardStatCard
                key={index}
                icon={
                  <ChartNoAxesColumnIncreasing className="text-[#3E79D6] bg-white rounded-[4px]" />
                }
                value={item?.value}
                label={item?.label}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Chart Filter and Graphs */}
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-6 xl:gap-6">

        <Card className="xl:col-span-2 p-3 sm:p-4 w-full overflow-hidden">
          <div className="w-full max-w-full">
            <PieCharts data={dashboardData} />
          </div>
        </Card>

        {/* Bar chart — full width below xl */}
        <Card className="xl:col-span-4 p-3 sm:p-4 w-full overflow-hidden">
          <div className="w-full max-w-full overflow-x-auto">
            {(roles?.includes("ADMIN") || roles?.includes("SUPER_ADMIN")) && (
              <BarCharts
                data={adminChartData}
                showDropdown={false}
                dropdownLabel="Claims By"
              />
            )}
            {(roles?.includes("HOSPITAL") ||
              roles?.includes("HOSPITAL_MANAGER")) && (
              <BarCharts
                data={dashboardData}
                showDropdown
                dropdownLabel="Claims By"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
