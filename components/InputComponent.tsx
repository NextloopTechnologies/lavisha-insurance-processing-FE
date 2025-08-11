"use client";
import React from "react";
import { Input } from "./ui/input";

const InputComponent = ({ value, onChange, placeHolder,Icon }) => {
  return (
    <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md">
      {/* <UserIcon /> */}
      <Icon className="w-4 h-4 text-[#3E79D6] ml-2" />
      <Input
        placeholder={placeHolder}
        className="pl-1 w-full  bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-black placeholder:font-semibold"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default InputComponent;
