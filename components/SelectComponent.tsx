"use client";
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";

const SelectComponent = ({
  value,
  onValueChange,
  selectOption,
  label,
  Icon,
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full flex justify-between bg-[#F2F7FC] text-black font-semibold">
          <div className="flex gap-x-2 items-center">
            {Icon && <Icon className="w-5 h-5 text-[#3E79D6]" />}
            <SelectValue placeholder={label} />
          </div>
        </SelectTrigger>
      <SelectContent>
        {selectOption.map((tpa) => (
          <SelectItem key={tpa} value={tpa}>
            {tpa}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectComponent;
