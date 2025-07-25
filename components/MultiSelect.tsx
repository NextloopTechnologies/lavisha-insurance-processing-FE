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
      setSelectedStatuses(status.map((s) => s.name));
    }
  };

  const handleChange = (value: string) => {
    if (isMulti) {
      toggleStatus(value);
    } else {
      setSelectedStatuses(value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="md:w-[220px] justify-start bg-white rounded-md font-normal"
        >
          {selectedArray.length > 0
            ? selectedArray.join(", ")
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
                checked={selectedArray.includes(item.name)}
                onCheckedChange={() => handleChange(item.name)}
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
