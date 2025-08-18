import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
};

export default function DasboardStatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card className="bg-[#E2EDFF] shadow-none border-none">
      <CardContent className="flex flex-col justify-start gap-4">
        <span className="w-12 h-12 rounded-full bg-[#3E79D6] flex justify-center items-center">
          {icon}
        </span>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
