"use client";

import { useState } from "react";
import { Menu, ChevronDown, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { navItems } from "@/constants/menu";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  path?: string;
  children?: NavItem[];
};

const SidebarItem = ({
  item,
  level = 0,
}: {
  item: NavItem;
  level?: number;
}) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className={`pl-${level * 4} text-sm`}>
      <div
        className="flex items-center justify-between cursor-pointer hover:bg-gray-300  p-3"
        onClick={() => hasChildren && setOpen(!open)}
      >
        {item.path ? (
          <Link href={item.path} className="block w-full">
            {item.label}
          </Link>
        ) : (
          <span>{item.label}</span>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      {/* Sidebar */}
      <aside
        className={clsx(
          "transition-all duration-300 ease-in-out h-screen bg-white shadow-md overflow-y-auto",
          isOpen ? "w-60 p-4" : "w-0 p-0"
        )}
      >
        <hr className="text-red-400 p-2" />

        {isOpen && (
          <div className="space-y-2 text-gray-800 font-medium">
            {navItems.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={clsx(
          "flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-[calc(100%-15rem)]" : "w-full"
        )}
      >
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-10">
          <button
            className="block cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <Menu className="w-6 h-6 text-gray-700" />
            ) : (
              <X className="w-6 h-6 text-gray-700" />
            )}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
              New Claim
            </button>
            <span className="text-sm font-medium">ProfileNotification</span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
