import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { userImage } from "@/assets";

interface UserPopoverProps {
  userName: string;
  avatarUrl?: string;
  hospitalName: string;
  address: string;
  loggedInUserName: string;
}

export const ProfilePopover: React.FC<UserPopoverProps> = ({
  userName,
  avatarUrl,
  hospitalName,
  address,

  loggedInUserName,
}) => {
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <Popover open={openProfile} onOpenChange={setOpenProfile}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <span className=" w-10 h-10 flex justify-center items-center mb-2">
            <Image src={userImage} alt="Logout" className="mx-auto w-7 h-7 " />
          </span>
          <span className="text-sm font-medium">{loggedInUserName}</span>
          <ChevronDown
            className={`w-4 h-4 ${openProfile ? "rotate-180" : "rotate-0"}`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 rounded-none p-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 border rounded-full">
            📷
          </div>
          <div>
            <h4 className="font-semibold text-sm">{hospitalName}</h4>
            <p className="text-xs text-muted-foreground">{address}</p>
            <a
              href="#"
              className="text-blue-600 text-xs font-medium mt-1 block"
            >
              View Rate list
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
