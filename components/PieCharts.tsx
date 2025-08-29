"use client";
import { PieChart, Pie, Cell } from "recharts";
import { Link2 } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

const COLORS = ["#3b82f6", "#6366f1", "#a5b4fc"]; // Tailwind-like blue shades

const PieCharts = ({ data }) => {
  const chartData = useMemo(() => {
    return [
      { name: "Settled", value: Number(data?.percentageSettled || 0) },
      { name: "Enhancement", value: Number(data?.percentageEnhancement || 0) },
      { name: "Pending", value: Number(data?.percentagePending || 0) },
    ];
  }, [data]);
  return (
    <div className="p-2 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4">Claims</h2>
        <Link href="/claims">
          <Link2 className="cursor-pointer" />
        </Link>
      </div>
      <div className="flex justify-center items-center">
        <PieChart width={250} height={210}>
          <Pie
            data={chartData}
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <text
            x={125}
            y={110}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-3xl font-bold"
          >
            {data?.totalClaims || 0}
          </text>
        </PieChart>
      </div>
      <div className="flex justify-around mt-4 text-sm">
        {chartData?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[idx] }}
            ></span>
            {item.name} {item.value}%
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieCharts;
