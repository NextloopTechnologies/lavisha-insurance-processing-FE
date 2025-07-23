"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function MultiSelect({
  status,
  selectedStatuses,
  setSelectedStatuses,
  toggleStatus,
}: {
  selectedStatuses?: any;
  toggleStatus: (undefinded) => void;
  setSelectedStatuses: (undefinded) => void;
  status?: {
    name: string;
    icon: string;
    key: string;
  }[];
}) {
  const isAllSelected = selectedStatuses.length === status.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(status.map((s) => s.name));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="md:w-[220px] justify-start bg-white rounded-md font-normal"
        >
          {selectedStatuses.length > 0
            ? selectedStatuses.join(", ")
            : "Select Status"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px]">
        <div className="flex flex-col space-y-2">
          <label className="flex items-center gap-2 font-normal">
            <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} />
            Select All
          </label>

          <hr className="my-1" />

          {status.map((item) => (
            <label
              key={item.name}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedStatuses.includes(item.name)}
                onCheckedChange={() => toggleStatus(item.name)}
              />
              <img src={item.icon} alt={item.name} className="w-3" />
              <span className="text-sm">{item.name}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
