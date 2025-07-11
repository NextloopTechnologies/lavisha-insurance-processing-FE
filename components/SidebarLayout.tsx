"use client";

import { useState } from "react";
import { Menu, ChevronDown, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { navItems } from "@/constants/menu";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  path?: string;
  icon?: string;

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
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.path;
  return (
    <div className={`pl-${level * 4} text-sm`}>
      <div
        className={`flex items-center justify-between cursor-pointer  p-2 ${
          isActive ? "bg-[#FBBC05]" : "hover:shadow-sm"
        }`}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {item.path ? (
          <Link
            href={item.path}
            className="flex justify-start items-center gap-x-2 w-full "
          >
            <span>
              <img src={item.icon} alt="Logo" className="mx-auto w-3" />
            </span>
            <span>{item.label}</span>
          </Link>
        ) : (
          <div className="flex justify-start items-center gap-x-2 w-full ">
            <span>
              <img src={item.icon} alt="Logo" className="mx-auto w-3" />
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
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 w-full ">
      <aside
        className={clsx(
          "transition-all relative duration-300 ease-in-out h-screen bg-white shadow-md overflow-y-auto",
          isOpen ? "w-60 " : "w-0 p-0"
        )}
      >
        <div className="w-full flex justify-center border-b-1 border-gray-500">
          <div className="w-24 h-24">
            <img
              src="assets/larisha-logo.png"
              alt="Logo"
              className="w-full h-full"
            />
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
          <div className="space-y-4 text-gray-800 font-medium pl-6 pt-6 w-full">
            <div
              className={`flex items-center justify-start cursor-pointer shadow-sm p-2 
         hover:bg-[#FBBC05]
        `}
              // onClick={() => hasChildren && setOpen(!open)}
            >
              <span>
                <img
                  src={"assets/patient.png"}
                  alt="Logout"
                  className="mx-auto w-3"
                />
              </span>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={clsx(
          "flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-[calc(100%-15rem)]" : "w-full"
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

          <div className="flex items-center gap-2 ml-auto">
            <button className=" text-white block w-10 h-10  text-sm">
              {/* Notification */}
              <img
                src={"assets/notification_icon.png"}
                alt="Logout"
                className="mx-auto w-6 h-6"
              />
            </button>
            <span className=" w-10 h-10 flex justify-center items-center mb-2">
              <img
                src={"assets/user.png"}
                alt="Logout"
                className="mx-auto w-7 h-7 "
              />
            </span>
            <span className="text-sm font-medium">User Name</span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
