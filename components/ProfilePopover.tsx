import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Eye } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { userImage } from "@/assets";

interface UserPopoverProps {
  userName?: string;
  avatarUrl?: string;
  hospitalName?: string;
  address?: string;
  loggedInUserName: string;
  setOpenEditProfile: any;
  profileData?: [
    {
      hospitalName?: string;
      address?: string;
      rateListUrl?: string;
      profileUrl?: string;
      rateListFileName?: string;
    }
  ];
}

export const ProfilePopover: React.FC<UserPopoverProps> = ({
  userName,
  avatarUrl,
  hospitalName,
  address,
  profileData,
  loggedInUserName,
  setOpenEditProfile,
}) => {
  const [openProfile, setOpenProfile] = useState(false);
  const handleViewRateList = (file) => {
    if (file) {
      const newWindow = window.open(file, "_blank");
      newWindow.onload = () => {
        newWindow.print();
      };
    }
  };
  return (
    <Popover open={openProfile} onOpenChange={setOpenProfile}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <span className=" w-10 h-10 flex justify-center items-center mb-2">
            {profileData?.[0]?.profileUrl ? (
              <img
                src={profileData?.[0]?.profileUrl}
                alt="profile"
                className="mx-auto w-7 h-7 "
              />
            ) : (
              <Image
                src={userImage}
                alt="profile"
                className="mx-auto w-7 h-7 "
              />
            )}
          </span>
          <span className="text-sm font-medium">
            {profileData?.[0]?.hospitalName}
          </span>
          <ChevronDown
            className={`w-4 h-4 ${openProfile ? "rotate-180" : "rotate-0"}`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 rounded-none p-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 border rounded-full">
            <img
              src={profileData?.[0]?.profileUrl}
              alt="Logout"
              className="mx-auto w-7 h-7 "
            />
          </div>
          <div>
            <h4 className="font-semibold text-sm">
              {profileData?.[0]?.hospitalName}
            </h4>
            <p className="text-xs text-muted-foreground">
              {profileData?.[0]?.address}
            </p>
            <div
              onClick={() => handleViewRateList(profileData?.[0]?.rateListUrl)}
              className="flex justify-start items-start gap-x-2 my-1 px-4 py-2 hover:bg-[#3E79D6]"
            >
              <Eye className="w-4 h-4 hover:text-blue-600 cursor-pointer" />{" "}
              <a href="#" className="text-xs font-medium  block">
                View Rate list
              </a>
            </div>
            <div
              onClick={() => setOpenEditProfile(true)}
              className="flex justify-start items-start gap-x-2 px-4 py-2 bg-[#3E79D6]"
            >
              <Pencil className="w-4 h-4 hover:text-blue-600 cursor-pointer text-[#FFFFFF]" />
              <a href="#" className="text-xs font-medium  block text-white">
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
