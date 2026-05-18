"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUpload, Folder, UserIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import InputComponent from "./InputComponent";
import { bulkDeleteFiles, uploadFiles } from "@/services/files";
import { updateProfile } from "@/services/profile";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useFormik } from "formik";
import { buildProfileEditSchema } from "@/lib/validationSchemas";
import { useState } from "react";

export function ProfileEditModal({
  openEditProfile,
  setOpenEditProfile,
  profileData,
}) {
  const [loading, setLoading] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const rateListInputRef = useRef<HTMLInputElement>(null);

  const isAdminOrSuperAdmin = ["ADMIN", "SUPER_ADMIN"].some((role) =>
    Cookies.get("user_role")?.includes(role)
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedInUserName(localStorage.getItem("userName"));
      setLoggedInUserId(localStorage.getItem("userId"));
    }
  }, []);

  const validationSchema = buildProfileEditSchema(isAdminOrSuperAdmin);

  // ---------------------------------------------------------------------------
  // Formik
  // ---------------------------------------------------------------------------
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name:
        profileData?.[0]?.name ||
        loggedInUserName ||
        "",
      address: profileData?.[0]?.address || "",
      hospitalName: profileData?.[0]?.hospitalName || "",
      rateListFileNames: profileData?.[0]?.rateListFileNames ?? [],
      rateListUrls: profileData?.[0]?.rateListUrls ?? [],
      profileFileName: profileData?.[0]?.profileFileName || "",
      profileUrl: profileData?.[0]?.profileUrl || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!loggedInUserId) return;
      try {
        const { rateListUrls, ...payload } = values;
        setLoading(true);
        const res = await updateProfile(payload, loggedInUserId);
        if (res?.status === 200) {
          setLoading(false);
          setOpenEditProfile(false);
          toast.success("Profile updated successfully");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to update profile");
      } finally {
        setLoading(false);
      }
    },
  });

  // ---------------------------------------------------------------------------
  // Profile photo upload (not validated)
  // ---------------------------------------------------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    formik.setFieldValue("profileUrl", URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles");

    try {
      const res = await uploadFiles(formData);
      formik.setFieldValue("profileFileName", res?.data?.key);
      formik.setFieldValue("profileUrl", res.data?.url);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile photo");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Rate list upload/remove (not validated)
  // ---------------------------------------------------------------------------
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

  const handleClose = (isOpen: boolean) => {
    setOpenEditProfile(isOpen);
    if (!isOpen) formik.resetForm();
  };

  // Inline error helper
  const fieldError = (name: string) =>
    (formik.touched as any)[name] && (formik.errors as any)[name] ? (
      <p className="text-red-500 text-xs mt-1">{(formik.errors as any)[name]}</p>
    ) : null;

  return (
    <Dialog open={openEditProfile} onOpenChange={handleClose}>
      <DialogContent
        className={`sm:max-w-md ${
          isAdminOrSuperAdmin ? "max-w-[500px]" : "h-[calc(100vh-100px)]"
        } rounded-2xl px-6 py-8`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Profile Edit</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-scroll">
          {/* Profile photo — no validation */}
          <div className="flex flex-col items-center justify-center gap-3 my-4">
            <label htmlFor="profile-photo" className="cursor-pointer">
              {formik.values.profileUrl ? (
                <div className="w-full flex justify-center items-center">
                  <img
                    src={formik.values.profileUrl}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-full border"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 flex items-center justify-center rounded-full border">
                  <span className="text-[50px] font-semibold text-[#3E79D6]">
                    {formik.values.name?.[0]}
                  </span>
                </div>
              )}
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <p className="text-sm text-center mt-2 text-gray-600 w-full">
                Change Profile Photo
              </p>
            </label>
          </div>

          {/* Name — validated */}
          <div className="w-full">
            <InputComponent
              placeHolder={!isAdminOrSuperAdmin ? "Hospital Name" : "Admin Name"}
              Icon={UserIcon}
              value={formik.values.name}
              onChange={(e) => formik.setFieldValue("name", e.target.value)}
              onBlur={() => formik.setFieldTouched("name", true)}
            />
            {fieldError("name")}
          </div>

          {/* Address — validated for non-admin */}
          <div className="my-4">
            {!isAdminOrSuperAdmin && (
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
            )}
          </div>

          {/* Rate List — no validation */}
          {!isAdminOrSuperAdmin && (
            <div className="border rounded-md bg-blue-50 p-0 w-full max-w-full mb-3">
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

          {/* Actions */}
          <div className="flex justify-center gap-4 w-full mt-6">
            <DialogClose asChild>
              <Button variant="outline" className="text-[#3E79D6]">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => formik.handleSubmit()}
              className="bg-[#3E79D6] text-white"
              disabled={loading}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}