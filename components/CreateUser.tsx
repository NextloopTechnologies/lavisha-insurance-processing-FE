// app/create-user/page.tsx or /components/CreateUserForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CameraIcon,
  UserIcon,
  BadgeIcon,
  LockIcon,
  BriefcaseIcon,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function CreateUser() {
  const [user, setUser] = useState({
    role: "",
    name: "",
    id: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };
  const handleChange = (field: string, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8 mt-10">
      <h2 className="text-xl font-semibold mb-6">Create User</h2>

      <div className="flex flex-col items-center mb-6">
        <label htmlFor="profile-upload" className="cursor-pointer">
          {previewURL ? (
            <img
              src={previewURL}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center">
              <CameraIcon className="w-10 h-10 text-blue-400" />
            </div>
          )}
        </label>
        <input
          type="file"
          accept="image/*"
          id="profile-upload"
          className="hidden"
          onChange={handleImageChange}
        />
        <p className="mt-2 text-sm text-black font-semibold">Upload Photo</p>
      </div>

      <div className="space-y-4">
        <Select onValueChange={(value) => handleChange("role", value)}>
          <SelectTrigger className="w-full flex justify-between bg-[#F2F7FC]">
            <div className="flex gap-x-4">
              <Users className="w-6 h-6 text-[#3E79D6]" />
              <span className="text-black font-semibold">Role</span>
            </div>
            {/* <SelectValue placeholder="Role" /> */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">Hospital</SelectItem>
            <SelectItem value="doctor">Hospital Manager</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md">
          <UserIcon className="w-5 h-5 text-[#3E79D6]" />
          <Input
            type="text"
            placeholder="Name"
            className="bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-black placeholder:font-semibold"
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md w-full">
            <BadgeIcon className="w-5 h-5 text-[#3E79D6]" />
            <Input
              type="text"
              placeholder="ID"
              className="bg-transparent border-none focus-visible:ring-0 shadow-none focus:bg-transparent placeholder:text-black placeholder:font-semibold"
              value={user.id}
              onChange={(e) => handleChange("id", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md w-full">
            <LockIcon className="w-5 h-5 text-[#3E79D6]" />
            <Input
              type="password"
              placeholder="Password"
              className="bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-black placeholder:font-semibold"
              value={user.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="ghost"
          className="text-[#3E79D6] bg-[#3E79D61C] hover:text-[#3E79D6] hover:bg-[#3E79D61C] cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          className="bg-[#3E79D6] text-[#FFF] rounded-md px-4 py-4 hover:bg-[#6f94cf] cursor-pointer"
          onClick={handleCreate}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
