"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  dashboardData: any;
  loggedInUserName: string | null;
}

const HospitalDashboard: React.FC<Props> = ({ dashboardData, loggedInUserName }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Welcome Hospital!</h2>
          <p className="text-gray-600">{loggedInUserName}</p>
        </div>
        <img src="assets/doctor-hospital.svg" alt="hospital" className="h-32" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#E2EDFF]">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{dashboardData?.activeClaims}</p>
            <p className="text-sm text-gray-500">Active Claims</p>
          </CardContent>
        </Card>
        <Card className="bg-[#E2EDFF]">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{dashboardData?.totalPatients}</p>
            <p className="text-sm text-gray-500">Total Patients</p>
          </CardContent>
        </Card>
        <Card className="bg-[#E2EDFF]">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">90%</p>
            <p className="text-sm text-gray-500">Settlement Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalDashboard;
