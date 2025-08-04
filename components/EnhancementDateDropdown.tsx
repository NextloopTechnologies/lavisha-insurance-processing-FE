import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatRaisedDate } from "@/lib/utils";

type Enhancement = {
  id: string;
  raisedAt: string;
};

type EnhancementSelectProps = {
  enhancements: Enhancement[];
  selectedId: string;
  onChange: (id: string) => void;
};

export default function EnhancementDateDropdown({
  enhancements,
  selectedId,
  onChange,
}: EnhancementSelectProps) {
  console.log("enhancements", enhancements);
  return (
    <Select onValueChange={onChange} value={selectedId}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select Raised Date" />
      </SelectTrigger>
      <SelectContent>
        {enhancements.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {formatRaisedDate(e.raisedAt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
