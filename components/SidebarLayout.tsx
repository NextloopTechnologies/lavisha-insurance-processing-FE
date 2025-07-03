"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { navItems } from "@/constants/menu";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function SidebarLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 min-w-fit">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 top-0 left-0  w-60 h-screen bg-gray-100 p-4 space-y-4 text-lg font-medium
          transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300
          md:relative md:translate-x-0 md:block
        `}
      >
        <div className="space-y-2">
          {/* <div className="hover:text-blue-600 cursor-pointer">Dashboard</div>
          <div className="hover:text-blue-600 cursor-pointer">Claims</div>
          <div className="hover:text-blue-600 cursor-pointer">Patients</div>
          <div className="hover:text-blue-600 cursor-pointer">Queries</div>
          <div className="hover:text-blue-600 cursor-pointer">Settlements</div>
          <div className="hover:text-blue-600 cursor-pointer">Enhancements</div> */}
          {navItems.map((item) => {
            return (
              <div
                key={item.path}
                className="hover:text-blue-600 cursor-pointer"
              >
                <Link href={item.path}>{item.label}</Link>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-2 p-4 w-full">
        {/* Top bar */}
        <div className="flex items-center justify-end mb-4">
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          {/* <div className="text-lg font-semibold">Search / Filters</div> */}
          <div className="flex items-center gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
              New Claim
            </button>
            <span className="text-sm font-medium">ProfileNotification</span>
          </div>
        </div>

        {/* Page content */}
        <div className="bg-white  rounded-md  shadow-sm">{children}</div>
      </div>
    </div>
  );
}
