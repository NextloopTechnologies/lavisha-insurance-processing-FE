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
import { useEffect, useMemo, useState } from "react";

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

const BarCharts = ({ data }) => {
  const [dropdown, setDropdown] = useState([]);
  const [filter, setFilter] = useState<any>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  // const grouped = [];
  // const chartGrouped = {};
  // for (let element in data) {
  //   if (Array.isArray(data[element])) {
  //     grouped.push({ name: element });
  //     chartGrouped[element] = element;
  //   }
  // }

  // const chartData = filter === "TPA" ? dataTPA : dataInsurance;
  const handleChange = (value: string) => {
    setFilter(value);
  };
  // const chartData = useMemo(() => {
  //   if (Object.keys(chartGrouped).length > 0) {
  //     return chartGrouped?.[filter].map((item) => {
  //       return {
  //         ...item,
  //         value: item?.count,
  //       };
  //     });
  //   }
  // }, [filter, chartGrouped]);

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

  console.log("chartData", chartData);
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
