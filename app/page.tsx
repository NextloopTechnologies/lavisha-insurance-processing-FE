"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
// import { DateRangePicker } from "@/components/shared/date-range-picker";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
import SidebarLayout from "@/components/SidebarLayout";
import PieCharts from "@/components/PieCharts";
import BarCharts from "@/components/BarCharts";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  return (
    <SidebarLayout>
      <div className="relative  p-6 space-y-6 h-[calc(100vh-100px)] overflow-y-scroll">
        {/* Top Welcome + Metrics Section */}
        <div className=" flex justify-end">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className=" md:col-span-2 flex flex-row  items-center justify-between p-6">
            <div>
              <h2 className="text-3xl font-semibold mt-4">Welcome!</h2>
              <p className="text-gray-600">User name</p>
            </div>
            <img
              src="assets/doctor-hospital.svg"
              alt="doctor"
              className="h-32"
            />
          </Card>

          <Card className="md:col-span-4 grid grid-cols-3 md:gap-10 md:px-10 px-2">
            <Card className="bg-[#E2EDFF] shadow-none border-none">
              <CardContent className="flex flex-col justify-start gap-4">
                <span className="w-12 h-12 rounded-full bg-[#3E79D6] flex justify-center items-center">
                  <ChartNoAxesColumnIncreasing className="text-[#3E79D6] bg-white rounded-[4px]" />
                </span>
                <p className="text-2xl font-bold">90%</p>
                <p className="text-sm text-gray-500">
                  Average Settlement Amount %
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#E2EDFF] shadow-none border-none">
              <CardContent className="flex flex-col justify-start gap-4">
                <span className="w-12 h-12 rounded-full bg-[#3E79D6] flex justify-center items-center">
                  <ChartNoAxesColumnIncreasing className="text-[#3E79D6] bg-white rounded-[4px]" />
                </span>
                <p className="text-2xl font-bold">110</p>
                <p className="text-sm text-gray-500">Active Claim</p>
              </CardContent>
            </Card>
            <Card className="bg-[#E2EDFF] shadow-none border-none">
              <CardContent className="flex flex-col justify-start gap-4">
                <span className="w-12 h-12 rounded-full bg-[#3E79D6] flex justify-center items-center">
                  <ChartNoAxesColumnIncreasing className="text-[#3E79D6] bg-white rounded-[4px]" />
                </span>
                <p className="text-2xl font-bold">550</p>
                <p className="text-sm text-gray-500">Active Cases</p>
              </CardContent>
            </Card>
          </Card>
        </div>

        {/* Chart Filter and Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="p-4 md:col-span-2">
            <PieCharts />
          </Card>

          {/* Right - Bar Chart by TPA */}
          <Card className="p-4 md:col-span-4">
            <BarCharts />
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
