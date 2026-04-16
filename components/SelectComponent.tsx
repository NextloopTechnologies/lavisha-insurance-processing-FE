"use client";
import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

const SelectComponent = ({
  value,
  onValueChange,
  selectOption,
  label,
  Icon,
  searchable = false,
}) => {
  const [search, setSearch] = useState("");

  const filtered = searchable
    ? selectOption.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
      )
    : selectOption;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full flex justify-between bg-[#F2F7FC] text-black font-semibold">
        <div className="flex gap-x-2 items-center">
          {Icon && <Icon className="w-5 h-5 text-[#3E79D6]" />}
          <SelectValue placeholder={label} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {searchable && (
          <div className="flex items-center px-2 pb-2 border-b">
            <Search size={16} className="mr-2 text-[#3E79D6]" />
            <Input
              placeholder={`Search ${label}...`}
              className="h-8 border-none focus-visible:ring-0 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()} // 👈 here
            />
          </div>
        )}
        {filtered.length ? (
          filtered.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))
        ) : (
          <p className="text-sm text-gray-400 px-2 py-1">No results found</p>
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectComponent;