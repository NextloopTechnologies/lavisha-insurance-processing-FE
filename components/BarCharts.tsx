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
import { useEffect, useState } from "react";

type ChartItem = {
  name: string;
  count: number;
};

type BarChartsProps = {
  data: Record<string, ChartItem[]> | ChartItem[];
  showDropdown?: boolean; // optional
  dropdownLabel?: string; // optional label for dropdown
};

const BarCharts = ({
  data,
  showDropdown = true,
  dropdownLabel = "Claim By",
}: BarChartsProps) => {
  const [dropdown, setDropdown] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [chartData, setChartData] = useState<ChartItem[]>([]);

  const handleChange = (value: string) => {
    setFilter(value);
  };

  useEffect(() => {
    if (Array.isArray(data)) {
      // Simple array (no dropdown case)
      setDropdown([]);
      setFilter("");
      setChartData(
        data.map((item) => ({
          ...item,
          value: item.count,
        }))
      );
    } else {
      // Object with multiple keys
      const validKeys = Object.keys(data).filter((key) =>
        Array.isArray(data[key])
      );
      setDropdown(validKeys);

      if (validKeys.length > 0) {
        setFilter(validKeys[0]);
        setChartData(
          data[validKeys[0]].map((item) => ({
            ...item,
            value: item.count,
          }))
        );
      }
    }
  }, [data]);

  useEffect(() => {
    if (!Array.isArray(data) && filter && data[filter]) {
      setChartData(
        data[filter].map((item) => ({
          ...item,
          value: item.count,
        }))
      );
    }
  }, [filter, data]);

  const formatKeyLabel = (key: string) => {
    const labelWithoutPrefix = key.replace(/^claimsBy/, "");
    const spacedLabel = labelWithoutPrefix.replace(/([a-z])([A-Z])/g, "$1 $2");
    return spacedLabel.replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="bg-white flex flex-col justify-between">
      {/* Show dropdown only if enabled & multiple datasets exist */}
      <div
        className={`flex ${
          !showDropdown ? "justify-between" : "justify-end"
        } w-full my-2`}
      >
        {!showDropdown && (
          <h1 className="font-semibold text-xl">All Hospital</h1>
        )}
        {showDropdown && dropdown.length > 0 && (
          <div className="min-w-[200px] flex justify-end gap-x-4">
            <Label className="text-sm font-bold text-muted-foreground ">
              {dropdownLabel}
            </Label>
            <Select value={filter} onValueChange={handleChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={dropdownLabel} />
              </SelectTrigger>
              <SelectContent className=" w-full">
                <SelectGroup>
                  {dropdown.map((item) => (
                    <SelectItem key={item} value={item}>
                      {formatKeyLabel(item)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={255}>
        {chartData?.length > 0 ? (
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
        ) : (
          <div className="flex justify-center items-center">No data found</div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default BarCharts;
