"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

export function MultiSelect({
  status,
  selectedStatuses,
  setSelectedStatuses,
  toggleStatus,
  mode = "multi",
  updateClaimStatus,
  isClaimDetailsSelect,
  disable,
}: {
  selectedStatuses: string[] | string;
  toggleStatus: (value: string) => void;
  setSelectedStatuses: (val: any) => void;
  status: {
    name: string;
    icon: string;
    key: string;
  }[];
  mode?: "multi" | "single";
  updateClaimStatus?: (value: string) => void;
  isClaimDetailsSelect?: boolean;
  disable?: boolean;
}) {
  const isMulti = mode === "multi";
  const selectedArray = Array.isArray(selectedStatuses)
    ? selectedStatuses
    : [selectedStatuses];
  const isAllSelected = isMulti && selectedArray.length === status.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(status.map((s) => s.key));
    }
  };

  const handleChange = (value: string) => {
    if (isMulti) {
      toggleStatus(value);
    } else {
      // set status for multi mode
      if (!isClaimDetailsSelect) setSelectedStatuses(value);
      // for claim details select to update local state value without refresh
      // if (["SENT_TO_TPA", "DENIED", "APPROVED"].includes(value)) {
      //   setSelectedStatuses(value);
      // }
      if (updateClaimStatus) updateClaimStatus(value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disable}
          variant="outline"
          className={`md:w-[220px] justify-start bg-white rounded-md font-normal ${
            Boolean(disable) ? " cursor-not-allowed" : " cursor-pointer"
          }`}
        >
          {/* {selectedArray.length > 0
            ? selectedArray.join(", ")
            : "Select Status"} */}
          {selectedArray.length > 0
            ? status
                .filter((s) => selectedArray.includes(s.key))
                .map((s) => s.name)
                .join(", ")
            : "Select Status"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px]">
        <div className="flex flex-col space-y-2">
          {isMulti && (
            <>
              <label className="flex items-center gap-2 font-normal">
                <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} />
                Select All
              </label>
              <hr className="my-1" />
            </>
          )}

          {status.map((item) => (
            <label
              key={item.name}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedArray.includes(item.key)}
                onCheckedChange={() => handleChange(item.key)}
              />
              <Image src={item.icon} alt={item.name} className="w-3" />
              <span className="text-sm">{item.name}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
