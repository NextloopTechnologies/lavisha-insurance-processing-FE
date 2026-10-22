"use client";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Link2 } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

// one colour per stage, in the API's stage order
const COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#6366f1", "#22c55e", "#9ca3af"];

type StageStatus = { status: string; label: string; count: number };
type Stage = { key: string; label: string; count: number; percentage: string; statuses: StageStatus[] };

/** Older API responses only had three percentages. */
const legacyStages = (data: any): Stage[] => [
  { key: "SETTLED", label: "Settled", count: 0, percentage: data?.percentageSettled ?? "0.00", statuses: [] },
  { key: "ENHANCEMENT", label: "Enhancement", count: 0, percentage: data?.percentageEnhancement ?? "0.00", statuses: [] },
  { key: "PRE_AUTH", label: "Pending", count: 0, percentage: data?.percentagePending ?? "0.00", statuses: [] },
];

const StageTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const stage: Stage = payload[0].payload;
  return (
    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow">
      <p className="font-semibold">
        {stage.label}: {stage.count} ({stage.percentage}%)
      </p>
      {stage.statuses
        .filter((s) => s.count > 0)
        .map((s) => (
          <p key={s.status} className="text-gray-600">
            {s.label}: {s.count}
          </p>
        ))}
    </div>
  );
};

const PieCharts = ({ data }) => {
  const stages: Stage[] = useMemo(
    () => (Array.isArray(data?.claimsByStage) ? data.claimsByStage : legacyStages(data)),
    [data],
  );
  const colorOf = (key: string) => COLORS[Math.max(0, stages.findIndex((s) => s.key === key)) % COLORS.length];
  // slices need a positive value; fall back to percentages for the legacy shape
  const slices = stages
    .map((s) => ({ ...s, value: s.count || Number(s.percentage) || 0 }))
    .filter((s) => s.value > 0);
  const total = data?.totalClaims ?? data?.monthlyClaims ?? 0;

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
          <Pie data={slices} innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" nameKey="label">
            {slices.map((s) => (
              <Cell key={s.key} fill={colorOf(s.key)} />
            ))}
          </Pie>
          <Tooltip content={<StageTooltip />} />
          <text x={125} y={110} textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold">
            {total}
          </text>
        </PieChart>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-sm">
        {stages.map((s) => (
          <div key={s.key} className="flex items-center gap-1" title={s.statuses.map((x) => `${x.label}: ${x.count}`).join("\n")}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorOf(s.key) }}></span>
            {s.label} {s.percentage}%
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieCharts;
