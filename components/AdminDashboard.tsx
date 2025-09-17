"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { boolean } from "yup";
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
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-[#474747] font-semibold">Dashboard</h1>
        <div className="flex justify-between items-center gap-x-4">
          {hospitalFilter && (
            <div className="min-w-[200px] flex justify-end gap-x-4">
              <Label className="text-sm font-bold text-muted-foreground mb-1">
                All Hospital
              </Label>
              <Select
                value={selectHospital}
                onValueChange={handleHospitalChange}
                defaultValue=" "
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Hospital" />
                </SelectTrigger>
                <SelectContent className=" w-full">
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
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card className=" md:col-span-2 flex flex-row  items-center justify-between p-6">
          <div>
            <h2 className="text-3xl font-semibold mt-4">Welcome!</h2>
            <p className="text-gray-600">{loggedInUserName}</p>
          </div>
          <img
            src="assets/doctor-hospital.svg"
            alt="doctor"
            className="h-20 md:h-20"
          />
        </Card>

        <Card className="md:col-span-4 grid grid-cols-3 md:gap-10 md:px-10 px-2">
          {statCardData?.map((item) => (
            <DasboardStatCard
              icon={
                <ChartNoAxesColumnIncreasing className="text-[#3E79D6] bg-white rounded-[4px]" />
              }
              value={item?.value}
              label={item?.label}
            />
          ))}
        </Card>
      </div>

      {/* Chart Filter and Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card className="p-4 md:col-span-2">
          <PieCharts data={dashboardData} />
        </Card>

        {/* Right - Bar Chart by TPA */}
        <Card className="p-4 md:col-span-4">
          {/* <BarCharts data={dashboardData} /> */}
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
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
