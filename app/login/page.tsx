// app/login/page.tsx or src/pages/login.tsx (based on your setup)
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"admin" | "hospital">("admin");

  return (
    <div className="flex min-h-screen bg-grey-50 rounded-l-4xl">
      {/* Left Branding Section - only on desktop */}
      <div className="hidden lg:flex w-1/2 bg-primary text-white flex-col justify-center items-center relative">
        <img
          src="assets/doctor-bg.jpg"
          alt="Doctor background"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="z-10 text-center w-[600px]">
          <img
            src="assets/larisha-logo.png"
            alt="Logo"
            className="mx-auto mb-4 w-full"
          />
          {/* <h1 className="text-3xl font-bold">LARISHA HEALTH CARE PVT LTD</h1> */}
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-12  bg-white rounded-l-3xl">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <img
              src="assets/larisha-logo.png"
              alt="Logo"
              className="mx-auto w-20"
            />
            <h2 className="font-bold text-primary mt-2">
              LARISHA HEALTH CARE PVT LTD
            </h2>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Hi, Welcome! 👋
            </h1>
            <div className="mt-2 flex justify-center gap-6 text-sm font-semibold">
              <button
                className={`border-b-2 ${
                  loginType === "admin"
                    ? "border-yellow-400 text-yellow-500"
                    : "border-transparent text-gray-600"
                }`}
                onClick={() => setLoginType("admin")}
              >
                Admin Login
              </button>
              <button
                className={`border-b-2 ${
                  loginType === "hospital"
                    ? "border-yellow-400 text-yellow-500"
                    : "border-transparent text-gray-600"
                }`}
                onClick={() => setLoginType("hospital")}
              >
                Hospital Login
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full border-b border-yellow-300 px-2 py-2 focus:outline-none text-sm"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border-b border-yellow-300 px-2 py-2 focus:outline-none text-sm"
              />
              <span
                className="absolute right-2 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="remember"
                className="accent-yellow-400"
              />
              <label htmlFor="remember" className="text-gray-600">
                Remember me
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-full font-semibold text-sm"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
