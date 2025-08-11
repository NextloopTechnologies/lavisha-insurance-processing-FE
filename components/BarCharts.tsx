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

const BarCharts = ({ data }) => {
  const [dropdown, setDropdown] = useState([]);
  const [filter, setFilter] = useState<any>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleChange = (value: string) => {
    setFilter(value);
  };

  useEffect(() => {
    const validKeys = Object.keys(data).filter((key) =>
      Array.isArray(data[key])
    );
    setDropdown(validKeys);
    if (validKeys?.length > 0) {
      setFilter(validKeys[0]);
      setChartData(
        data[validKeys[0]]?.map((item) => {
          return {
            ...item,
            value: item?.count,
          };
        })
      );
    }
  }, [data]);

  useEffect(() => {
    if (filter && data[filter]) {
      setChartData(
        data[filter]?.map((item) => {
          return {
            ...item,
            value: item?.count,
          };
        })
      );
    }
  }, [filter, data]);
  const formatKeyLabel = (key: string) => {
    const labelWithoutPrefix = key.replace(/^claimsBy/, ""); // remove "claimsBy"
    const spacedLabel = labelWithoutPrefix.replace(/([a-z])([A-Z])/g, "$1 $2");
    return spacedLabel.replace(/^./, (str) => str.toUpperCase());
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
              {dropdown?.map((item) => (
                <SelectItem key={item} value={item}>
                  {formatKeyLabel(item)}
                </SelectItem>
              ))}
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
