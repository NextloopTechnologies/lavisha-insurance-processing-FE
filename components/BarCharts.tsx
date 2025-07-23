"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const dataTPA = [
  { name: "TPA Name ", value: 1300 },
  { name: "TPA Name ", value: 1700 },
  { name: "TPA Name ", value: 1900 },
  { name: "TPA Name ", value: "" },
];

const dataInsurance = [
  { name: "Insurance 1", value: 1400 },
  { name: "Insurance 2", value: 1200 },
  { name: "Insurance 3", value: 1500 },
];

const BarCharts = () => {
  const [filter, setFilter] = useState("TPA");
  const chartData = filter === "TPA" ? dataTPA : dataInsurance;
  const handleChange = (value: string) => {
    setFilter(value);
  };
  return (
    <div className="bg-white flex flex-col justify-between">
      <div className="min-w-[200px] flex justify-end gap-x-4">
        <Label className="text-sm font-bold text-muted-foreground mb-1">
          Claim By
        </Label>
        <Select value={filter} onValueChange={handleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Claim By" />
          </SelectTrigger>
          <SelectContent className=" w-full">
            <SelectGroup>
              <SelectItem value="Insurance">Insurance Company</SelectItem>
              <SelectItem value="TPA">TPA</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={255}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="#3b82f6"
            barSize={40}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarCharts;
