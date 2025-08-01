"use client";

import { useState } from "react";
import { Menu, ChevronDown, ChevronRight, X, Bell } from "lucide-react";
import Link from "next/link";
import { navItems } from "@/constants/menu";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { logout } from "@/services/auth";
import { logoImage, logoSvg, patientImage, userImage } from "../assets";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { NotificationPopover } from "./NotificationPopover";
import { recent, unread } from "@/constants/dummy";
import { ProfilePopover } from "./ProfilePopover";

type Props = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  path?: string;
  icon?: string | StaticImageData;

  children?: NavItem[];
};

const SidebarItem = ({
  item,
  level = 0,
  pathname,
}: {
  item: NavItem;
  level?: number;
  pathname?: string;
}) => {
  const [open, setOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.path;
  return (
    <div className={`pl-${level * 4} text-sm`}>
      <div
        className={`flex items-center justify-between cursor-pointer text-center px-6 py-2 md:py-2 md:px-2  ${
          isActive
            ? "bg-[#3E79D6] md:rounded-l-sm rounded-sm shadow-md text-white"
            : "hover:shadow-md"
        }`}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {item.path ? (
          <Link
            href={item.path}
            className="flex justify-start items-center gap-x-2 w-full "
          >
            <span>
              <Image src={item.icon} alt="Logo" className="mx-auto w-3 h-3" />
            </span>
            <span>{item.label}</span>
          </Link>
        ) : (
          <div className="flex justify-start items-center gap-x-2 w-full ">
            <span>
              <Image src={item.icon} alt="Logo" className="mx-auto w-3 h-3" />
            </span>
            <span>{item.label}</span>
          </div>
        )}
        {hasChildren && (
          <span>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div className="ml-2 mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItem key={child.label} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function SidebarLayout({ children }: Props) {
  const loggedInUserName = localStorage.getItem("userName");
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <div className="relative flex min-h-screen bg-gray-100 w-full ">
      <aside
        // className={clsx(
        //   "transition-all relative duration-300 ease-in-out h-screen bg-white shadow-md overflow-y-auto",
        //   isOpen ? "w-60 " : "w-0 p-0"
        // )}

        className={clsx(
          "transition-all relative duration-300 ease-in-out h-screen bg-white shadow-md overflow-y-auto hidden md:block w-0 md:w-60"
        )}
      >
        <div className="w-full flex justify-center border-b-1 border-gray-500">
          <div className="w-24 h-24">
            <Image src={logoSvg} alt="Logo" className="w-full h-full" />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-120px)]">
          {isOpen && (
            <div className="space-y-4 text-gray-800 font-medium pl-6 pt-2">
              {navItems.map((item) => (
                <SidebarItem key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          )}
          <div
            onClick={() => handleLogout()}
            className="space-y-4 text-gray-800 font-medium pl-6 pt-6 w-full"
          >
            <div
              className={`flex items-center justify-start cursor-pointer  p-2 
         hover:shadow-sm
        `}
              // onClick={() => hasChildren && setOpen(!open)}
            >
              <span>
                <Image src={userImage} alt="Logout" className="mx-auto w-3" />
              </span>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </aside>

      <div
        // className={clsx(
        //   "flex flex-col transition-all duration-300 ease-in-out",
        //   isOpen ? "w-[calc(100%-15rem)]" : "w-full"
        // )}
        className={clsx(
          "flex flex-col transition-all duration-300 ease-in-out w-[calc(100%)] md:w-[calc(100%-15rem)]"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-10">
          {/* <button
            className="block cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button> */}

          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex justify-center items-center gap-2 ml-auto">
              <NotificationPopover
                unreadNotifications={unread}
                recentNotifications={recent}
                unreadCount={unread.length}
                // setOpenNotification={setOpenNotification}
                // openNotification={openNotification}
              />
              <ProfilePopover
                userName="Dr. Aamir"
                // avatarUrl="/path-to-avatar.jpg"
                hospitalName="Hospital Name"
                address="101, Kanchan Sagar, 18/1, Near Industry House"
                loggedInUserName={loggedInUserName}
              />
              {/* <span
                onClick={() => setOpenProfile(true)}
                className=" w-10 h-10 flex justify-center items-center mb-2"
              >
                <Image
                  src={userImage}
                  alt="Logout"
                  className="mx-auto w-7 h-7 "
                />
              </span> */}
              {/* <span className="text-sm font-medium">{loggedInUserName}</span> */}
            </div>
            {/* mobile view */}
            <div className="md:hidden flex justify-between h-[calc(100%-120px)] w-90 overflow-scroll">
              {/* {isOpen && ( */}
              <div className="flex space-y-4 text-gray-800 font-medium pl-0 pt-2">
                {navItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    pathname={pathname}
                  />
                ))}
                <div
                  onClick={() => logout()}
                  className=" text-gray-800 font-medium pl-6 pt-6 w-full"
                >
                  <div
                    className={`flex items-center justify-start cursor-pointer  p-2 
         hover:shadow-sm
        `}
                    // onClick={() => hasChildren && setOpen(!open)}
                  >
                    <span>
                      <Image
                        src={patientImage}
                        alt="Logout"
                        className="mx-auto w-3"
                      />
                    </span>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-0">{children}</main>
      </div>
    </div>
  );
}
