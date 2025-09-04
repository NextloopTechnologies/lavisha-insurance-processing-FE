// app/create-user/page.tsx or /components/CreateUserForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { useEffect, useState } from "react";
import { uploadFiles } from "@/services/files";
import { createUsers, getUsersDropdown } from "@/services/users";
import FileDrag from "./FileDrag";
import SelectComponent from "./SelectComponent";
import { toast } from "sonner";

type BasePayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

type HospitalPayload = BasePayload & {
  address: string;
  hospitalName?: string;
  rateListFileName: string;
  hospitalId?: string;
};

type Payload = BasePayload | HospitalPayload;

export default function CreateUser() {
  const [user, setUser] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    address: "",
    hospitalName: "",
    rateListFileName: "",
    hospitalId: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fileUpload, setFileUpload] = useState({});
  const handleFileChange = async (value, name, multiple) => {
    const formData = new FormData();
    formData.append("file", value[0]);
    formData.append("folder", "hospitals");

    try {
      setLoading(true);
      const res = await uploadFiles(formData);
      setLoading(false);
      setUser((prev) => ({
        ...prev,
        rateListFileName: res?.data?.key,
      }));
    } catch (error) {
      setLoading(false);
      console.error("Single upload failed:", error);
    }
  };
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProfileImage(file);
    setPreviewURL(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles"); // static folder key

    try {
      const res = await uploadFiles(formData);
      setFileUpload({
        profileFileName: res?.data?.key,
        profileUrl: res.data?.url,
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    setLoading(true);

    try {
      let payload: Payload = {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        ...fileUpload,
      };

      if (user.role === "HOSPITAL") {
        payload = {
          ...payload,
          address: user.address,
          // hospitalName: user.hospitalName,
          rateListFileName: user.rateListFileName,
        } as HospitalPayload;
      }
      if (user.role === "HOSPITAL_MANAGER") {
        payload = {
          ...payload,
          address: user.address,
          hospitalId: user.hospitalId,
          rateListFileName: user.rateListFileName,
        } as HospitalPayload;
      }

      const res = await createUsers(payload);
      if (res?.status === 201) {
        setLoading(false);
        toast.success("Created Successfully");
        setUser({
          role: "",
          name: "",
          email: "",
          password: "",
          address: "",
          hospitalName: "",
          rateListFileName: "",
          hospitalId: "",
        });
      }
    } catch (error) {
      console.error("User Create error:", error);
    }
  };
  const fetchUsersDropdown = async () => {
    // setLoading(true);
    try {
      const res = await getUsersDropdown("HOSPITAL");
      if (res?.status === 200) {
        setUsers(res?.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersDropdown();
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] w-full p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-8 ">
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
          <Select
            value={user.role}
            onValueChange={(value) => handleChange("role", value)}
          >
            <SelectTrigger className="w-full flex justify-between bg-[#F2F7FC] text-black font-semibold">
              <div className="flex gap-x-2 items-center">
                <Users className="w-6 h-6 text-[#3E79D6]" />
                <SelectValue placeholder={"Role"} />
              </div>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="HOSPITAL">Hospital</SelectItem>
              <SelectItem value="HOSPITAL_MANAGER">Hospital Manager</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          {user.role == "HOSPITAL_MANAGER" && (
            <Select
              value={user.hospitalId}
              onValueChange={(value) => handleChange("hospitalId", value)}
            >
              <SelectTrigger className="w-full flex justify-between bg-[#F2F7FC] text-black font-semibold">
                <div className="flex gap-x-2 items-center">
                  <Users className="w-6 h-6 text-[#3E79D6]" />
                  <SelectValue placeholder={"Select Hospital"} />
                </div>
              </SelectTrigger>
              <SelectContent className=" w-full">
                <SelectGroup>
                  {users?.map((item, index) => (
                    <SelectItem value={item?.id}>{item?.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

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
          {/* {user.role == "HOSPITAL" && (
            <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md">
              <UserIcon className="w-5 h-5 text-[#3E79D6]" />
              <Input
                type="text"
                placeholder="Hospital Name"
                className="bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-black placeholder:font-semibold"
                value={user.hospitalName}
                onChange={(e) => handleChange("hospitalName", e.target.value)}
              />
            </div>
          )} */}

          <div className="flex flex-col gap-4">
            {user.role == "HOSPITAL" && (
              <div>
                <textarea
                  value={user.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Address"
                  className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300  focus:outline-border w-full"
                />
              </div>
            )}

            {user.role == "HOSPITAL" && (
              <FileDrag
                title={"RateList FileName"}
                multiple={false}
                onChange={handleFileChange}
                name={"rateListFileName"}
                // claimInputs={[profileInput?.rateListFileName]}
              />
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md w-full">
              <BadgeIcon className="w-5 h-5 text-[#3E79D6]" />
              <Input
                type="text"
                placeholder="ID"
                className="bg-transparent border-none focus-visible:ring-0 shadow-none focus:bg-transparent placeholder:text-black placeholder:font-semibold"
                value={user.email}
                onChange={(e) => handleChange("email", e.target.value)}
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
          {/* <Button
            variant="ghost"
            className="text-[#3E79D6] bg-[#3E79D61C] hover:text-[#3E79D6] hover:bg-[#3E79D61C] cursor-pointer"
          >
            Cancel
          </Button> */}
          <Button
            className="bg-[#3E79D6] text-[#FFF] rounded-md px-4 py-4 hover:bg-[#6f94cf] cursor-pointer"
            onClick={handleCreate}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
