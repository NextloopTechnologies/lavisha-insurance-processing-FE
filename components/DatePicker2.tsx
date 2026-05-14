import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DatePicker2({
  date,
  onChange,
  disableFuture = false,
  placeholder = "Select Date",
  className = "",
  disableBefore,
}: {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disableFuture?: boolean;
  placeholder?: string;
  className?: string;
  disableBefore?: Date;
}) {
  const [open, setOpen] = React.useState(false);

  const disabledDates = (day: Date) => {
    if (disableFuture && day > new Date()) return true;
    if (disableBefore && day < disableBefore) return true;
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-[#F2F7FC] text-sm text-black border border-input hover:bg-[#e8f0fb]",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#3E79D6] shrink-0" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            onChange(selected);
            setOpen(false);
          }}
          disabled={disabledDates}
          defaultMonth={disableBefore ?? date}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}