// components/date-range-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, predefinedRanges } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DateRangePickerProps {
  date: { from: Date; to: Date };
  setDate: (date: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ date, setDate }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [custom, setCustom] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "dd MMM yyyy")} -{" "}
                {format(date.to, "dd MMM yyyy")}
              </>
            ) : (
              format(date.from, "dd MMM yyyy")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex flex-col md:flex-row space-x-2 p-4 w-fit"
        align="start"
      >
        {/* Sidebar options */}
        <div className="flex flex-col gap-1 pr-2 border-r">
          {predefinedRanges.map(({ label, range }) => (
            <Button
              key={label}
              variant="ghost"
              className="justify-start text-left px-2"
              onClick={() => {
                setDate(range());
                setCustom(false);
                setOpen(false);
              }}
            >
              {label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="justify-start text-left px-2"
            onClick={() => setCustom(true)}
          >
            Custom Range
          </Button>
        </div>

        <div className="flex gap-4">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={date}
            onSelect={(range) => range && setDate(range)}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
