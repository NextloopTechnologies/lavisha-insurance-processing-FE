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
  Users,
  Folder,
  CloudUpload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { bulkDeleteFiles, uploadFiles } from "@/services/files";
import { createUsers, getUsersDropdown, updateUser } from "@/services/users";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";
import { buildUserAddSchema, buildUserEditSchema } from "@/lib/validationSchemas";

type BasePayload = {
  name: string;
  email: string;
  password?: string;
  role: string;
};

type HospitalPayload = BasePayload & {
  address: string;
  hospitalName?: string;
  rateListFileNames: string[];
  hospitalId?: string;
};

type Payload = BasePayload | HospitalPayload;

const emptyUser = {
  role: "",
  name: "",
  email: "",
  password: "",
  address: "",
  hospitalName: "",
  rateListFileNames: [] as string[],
  rateListUrls: [] as string[],
  hospitalId: "",
};



export default function CreateUser({
  userData,
  setUserData,
  setOpenDialog,
  fetchUsers,
  onSuccess,
  defaultRole,
  disableRole = false,
}: {
  userData?: any;
  setUserData: any;
  setOpenDialog: any;
  fetchUsers: any;
  onSuccess?: (data?: any) => void;
  defaultRole?: string;
  disableRole?: boolean;
}) {
  const isEditMode = !!userData?.id;
  const isSuperAdmin = userData?.role === "SUPER_ADMIN";

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fileUpload, setFileUpload] = useState({});
  const rateListInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Formik
  // -------------------------------------------------------------------------
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      role: userData?.role ?? defaultRole ?? "",
      name: userData?.name ?? "",
      email: userData?.email ?? "",
      password: userData?.password ?? "",
      address: userData?.address ?? "",
      hospitalName: userData?.hospital?.id ?? "",
      rateListFileNames: userData?.rateListFileNames ?? [],
      rateListUrls: userData?.rateListUrls ?? [],
      hospitalId: userData?.hospitalId ?? userData?.hospital?.id ?? "",
    },
    validationSchema: isEditMode
      ? buildUserEditSchema(userData?.role ?? "")
      : Yup.lazy((values: any) => buildUserAddSchema(values.role ?? "")),    
    onSubmit: async (values) => {
      if (isSuperAdmin) {
        toast.error("Super Admin users cannot be edited.");
        return;
      }

      setLoading(true);
      try {
        let payload: Payload = {
          name: values.name,
          email: values.email,
          role: values.role,
          ...fileUpload,
        };

        if (values.password) {
          payload.password = values.password;
        }

        if (values.role === "HOSPITAL") {
          payload = {
            ...payload,
            address: values.address,
            rateListFileNames: values.rateListFileNames,
          } as HospitalPayload;
        }
        if (values.role === "HOSPITAL_MANAGER") {
          payload = {
            ...payload,
            address: values.address,
            hospitalId: values.hospitalId,
          } as HospitalPayload;
        }

        if (isEditMode) {
          const res = await updateUser(payload, userData?.id);
          if (res?.status === 200) {
            toast.success("Updated Successfully");
          }
        } else {
          const res = await createUsers(payload);
          if (res?.status === 201) {
            toast.success("Created Successfully");
            onSuccess?.(res.data);
          }
        }

        await fetchUsers();
        setOpenDialog(false);
        setUserData(null);
        formik.resetForm();
      } catch (error: any) {
        console.error("User Create error:", error);
        const message = error?.response?.data?.message || "Something went wrong";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  // -------------------------------------------------------------------------
  // Rate list helpers (outside Formik — not validated)
  // -------------------------------------------------------------------------
  const handleRateListUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setLoading(true);
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "hospitals");
        return uploadFiles(formData);
      });

      const results = await Promise.all(uploadPromises);
      const newKeys = results.map((res) => res?.data?.key).filter(Boolean);
      const newUrls = results.map((res) => res?.data?.url).filter(Boolean);

      formik.setFieldValue("rateListFileNames", [
        ...formik.values.rateListFileNames,
        ...newKeys,
      ]);
      formik.setFieldValue("rateListUrls", [
        ...formik.values.rateListUrls,
        ...newUrls,
      ]);
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload files");
    } finally {
      setLoading(false);
      if (rateListInputRef.current) rateListInputRef.current.value = "";
    }
  };

  const handleRemoveRateList = async (index: number) => {
    const fileName = formik.values.rateListFileNames[index];
    try {
      setLoading(true);
      await bulkDeleteFiles([fileName]);
      formik.setFieldValue(
        "rateListFileNames",
        formik.values.rateListFileNames.filter((_, i) => i !== index)
      );
      formik.setFieldValue(
        "rateListUrls",
        formik.values.rateListUrls.filter((_, i) => i !== index)
      );
      toast.success("File removed successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to remove file");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Profile image helper
  // -------------------------------------------------------------------------
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProfileImage(file);
    setPreviewURL(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles");

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

  const fetchUsersDropdown = async () => {
    try {
      const res = await getUsersDropdown("HOSPITAL");
      if (res?.status === 200) {
        setUsers(res?.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsersDropdown();
  }, []);

  const handleCancel = () => {
    setOpenDialog(false);
    setUserData(null);
    formik.resetForm();
  };

  // Inline error helper
  const fieldError = (name: string) =>
    (formik.touched as any)[name] && (formik.errors as any)[name] ? (
      <p className="text-red-500 text-xs mt-1">{(formik.errors as any)[name]}</p>
    ) : null;

  // -------------------------------------------------------------------------
  // Guard: Super Admin cannot be edited
  // -------------------------------------------------------------------------
  if (isEditMode && isSuperAdmin) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-sm">
          <p className="text-red-600 font-semibold text-base mb-1">
            Cannot Edit Super Admin
          </p>
          <p className="text-sm text-gray-500">
            Super Admin user data cannot be modified.
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-[#3E79D6] bg-[#3E79D61C] hover:text-[#3E79D6] hover:bg-[#3E79D61C]"
          onClick={handleCancel}
        >
          Close
        </Button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="h-[calc(100vh-200px)] overflow-auto w-full">
      <div className="max-w-full mx-auto bg-white rounded-2xl p-4">
        {/* Profile photo */}
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
          {/* Role select */}
          <div>
            <Select
              value={formik.values.role}
              onValueChange={(value) => formik.setFieldValue("role", value)}
              disabled={disableRole}
            >
              <SelectTrigger
                className="w-full flex justify-between bg-[#F2F7FC] text-black font-semibold"
                onBlur={() => formik.setFieldTouched("role", true)}
              >
                <div className="flex gap-x-2 items-center">
                  <Users className="w-6 h-6 text-[#3E79D6]" />
                  <SelectValue placeholder={"Role"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="HOSPITAL">Hospital</SelectItem>
                <SelectItem value="HOSPITAL_MANAGER">Hospital Manager</SelectItem>
              </SelectContent>
            </Select>
            {fieldError("role")}
          </div>

          {/* Hospital select for manager */}
          {formik.values.role === "HOSPITAL_MANAGER" && (
            <div>
              <Select
                value={formik.values.hospitalId}
                onValueChange={(value) =>
                  formik.setFieldValue("hospitalId", value)
                }
              >
                <SelectTrigger
                  className="w-full flex justify-between bg-[#F2F7FC] text-black font-semibold"
                  onBlur={() => formik.setFieldTouched("hospitalId", true)}
                >
                  <div className="flex gap-x-2 items-center">
                    <Users className="w-6 h-6 text-[#3E79D6]" />
                    <SelectValue placeholder={"Select Hospital"} />
                  </div>
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectGroup>
                    {users?.map((item: any) => (
                      <SelectItem key={item?.id} value={item?.id}>
                        {item?.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldError("hospitalId")}
            </div>
          )}

          {/* Name */}
          <div>
            <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md">
              <UserIcon className="w-5 h-5 text-[#3E79D6]" />
              <Input
                type="text"
                placeholder="Name"
                className="bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-black placeholder:font-semibold"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="name"
              />
            </div>
            {fieldError("name")}
          </div>

          {/* Hospital-only fields */}
          {(formik.values.role === "HOSPITAL" ||
            formik.values.role === "HOSPITAL_MANAGER") && (
            <div className="flex flex-col gap-4">
              {/* Address */}
              <div>
                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Address"
                  className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300 focus:outline-border w-full"
                />
                {fieldError("address")}
              </div>

              {/* Rate List — no validation required */}
              {formik.values.role === "HOSPITAL" && (
                <div className="border rounded-md bg-blue-50 p-0 w-full max-w-full">
                  {/* Header */}
                  <div className="w-full min-h-[50px] rounded-md p-4 flex items-center justify-center bg-[#F2F7FC] border border-gray-200">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Folder className="h-5 w-5 text-blue-500" />
                        Rate List Files
                      </div>
                      <label className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        <CloudUpload className="h-4 w-4" />
                        Upload
                        <input
                          ref={rateListInputRef}
                          type="file"
                          accept=".jpeg,.jpg,.png,.webp,.pdf"
                          multiple
                          hidden
                          onChange={handleRateListUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Files grid */}
                  {formik.values.rateListFileNames.length > 0 && (
                    <div className="p-4 flex gap-4 items-center flex-wrap">
                      {formik.values.rateListFileNames.map((key, i) => (
                        <div key={i} className="text-center relative">
                          <a
                            href={formik.values.rateListUrls[i]}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={key.split("/").pop()}
                          >
                            <div className="border p-2 rounded">
                              <Folder className="h-10 w-10 text-blue-400 mx-auto" />
                            </div>
                            <div
                              className="text-xs mt-1 truncate max-w-[80px]"
                              title={key.split("/").pop()}
                            >
                              {key.split("/").pop()}
                            </div>
                          </a>
                          <span
                            className="cursor-pointer text-sm absolute -top-2 -right-1 text-red-500"
                            onClick={() => handleRemoveRateList(i)}
                          >
                            X
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Email + Password */}
          <div className="flex gap-4">
            {/* Email / ID — read-only in edit mode */}
            <div className="w-full">
              <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md">
                <BadgeIcon className="w-5 h-5 text-[#3E79D6]" />
                <Input
                  type="text"
                  placeholder="ID"
                  name="email"
                  className={`bg-transparent border-none focus-visible:ring-0 shadow-none focus:bg-transparent placeholder:text-black placeholder:font-semibold ${
                    isEditMode ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  readOnly={isEditMode}
                  disabled={isEditMode}
                />
              </div>
              {fieldError("email")}
            </div>

            <div className="w-full">
              <div className="flex items-center gap-2 bg-[#F2F7FC] p-1 rounded-md">
                <LockIcon className="w-5 h-5 text-[#3E79D6]" />
                <Input
                  type="password"
                  placeholder="Password"
                  name="password"
                  className="bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-black placeholder:font-semibold"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {fieldError("password")}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="text-[#3E79D6] bg-[#3E79D61C] hover:text-[#3E79D6] hover:bg-[#3E79D61C] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            className="bg-[#3E79D6] text-[#FFF] rounded-md px-4 py-4 hover:bg-[#6f94cf] cursor-pointer"
            onClick={() => formik.handleSubmit()}
            disabled={loading}
          >
            {isEditMode ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  );
}