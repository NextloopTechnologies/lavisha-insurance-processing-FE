"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import InputComponent from "./InputComponent";
import FileDrag from "./FileDrag";
import { uploadFiles } from "@/services/files";
import { updateProfile } from "@/services/profile";
import Cookies from "js-cookie";

export function ProfileEditModal({
  openEditProfile,
  setOpenEditProfile,
  profileData,
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  const [profileInput, setProfileInput] = useState({
    name: loggedInUserName,
    address: "",
    hospitalName: "",
    rateListFileName: "",
    profileFileName: "",
    profileUrl: "",
  });

  const isAdminOrSuperAdmin = ['ADMIN', 'SUPER_ADMIN'].some(role => Cookies.get("user_role")?.includes(role));

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedInUserName(localStorage.getItem("userName"));
      setLoggedInUserId(localStorage.getItem("userId"));
    }
  }, []);

  useEffect(() => {
    if (!profileData?.length) {
      setProfileInput({
        name: loggedInUserName,
        address: "",
        hospitalName: "",
        rateListFileName: "",
        profileFileName: "",
        profileUrl: "",
      });
    } else {
      // Map documents by their type
      const documentMap = profileData.reduce((acc, doc) => {
        if (doc.type === "OTHER") {
          acc[doc.type] = acc[doc.type] || [];
          acc[doc.type].push({
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type,
            remark: doc.remark,
          });
        } else {
          acc[doc.type] = {
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type,
          };
        }
        return acc;
      }, {});
      setProfileInput({
        name: profileData?.[0]?.name || loggedInUserName,
        address: profileData?.[0]?.address,
        hospitalName: profileData?.[0]?.hospitalName,
        rateListFileName: profileData?.[0]?.rateListUrl,
        profileFileName: profileData?.[0]?.profileFileName,
        profileUrl: profileData?.[0]?.profileUrl,
      });
    }
  }, [profileData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles");

    try {
      const res = await uploadFiles(formData);
      setProfileInput((prev) => ({
        ...prev,
        profileFileName: res?.data?.key,
        profileUrl: res.data?.url,
      }));
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string | boolean, name: string) => {
    setProfileInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (value, name, multiple) => {
    const formData = new FormData();
    formData.append("file", value[0]);
    formData.append("folder", "hospitals");

    try {
      setLoading(true);
      const res = await uploadFiles(formData);
      setLoading(false);
      setProfileInput((prev) => ({
        ...prev,
        rateListFileName: res?.data?.key,
      }));
    } catch (error) {
      setLoading(false);
      console.error("Single upload failed:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (loggedInUserId) {
      try {
        console.log('profileInput before update', profileInput);
        const payload = { ...profileInput };  
        setLoading(true);
        const res = await updateProfile(payload, loggedInUserId);
        if (res?.status === 200) {
          setLoading(false);
          setOpenEditProfile(false);
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        // setLoading(false);
      }
    }
  };

  const handleClose = (isOpen: boolean) => {
    setOpenEditProfile(isOpen);
  };
 console.log('profileInput', profileInput);
  return (
    <Dialog open={openEditProfile} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-md ${isAdminOrSuperAdmin ? 'max-w-[500px]' : 'h-[calc(100vh-100px)]'} rounded-2xl px-6 py-8`} >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Profile Edit
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-scroll">
          <div className="flex flex-col items-center justify-center gap-3 my-4">
            <label htmlFor="profile-photo" className="cursor-pointer">
              {profileInput?.profileUrl != null ? (
                <div className="w-full flex justify-center items-center">
                  <img
                    src={profileInput?.profileUrl}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-full border"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 flex items-center justify-center rounded-full border">
                  <span className="text-[50px] font-semibold text-[#3E79D6]">
                    {profileInput?.name?.[0]}
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

          {/* Adjust input based on role */}
          <div className="w-full">
            {!isAdminOrSuperAdmin ? (
              <InputComponent
                placeHolder={"Hospital Name"}
                Icon={UserIcon}
                value={profileInput.name}
                onChange={(e) => handleInputChange(e.target.value, "name")}
              />
            ) : (
              <InputComponent
                placeHolder={"Admin Name"}
                Icon={UserIcon}
                value={profileInput.name}
                onChange={(e) => handleInputChange(e.target.value, "name")}
              />
            )}
          </div>

          <div className="my-4">
            {!isAdminOrSuperAdmin && (
              <textarea
                value={profileInput.address}
                onChange={(e) => handleInputChange(e.target.value, "address")}
                placeholder="Address"
                className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300 focus:outline-border w-full"
              />
            )}
          </div>

          {!isAdminOrSuperAdmin && (
            <FileDrag
              title={"RateList FileName"}
              multiple={false}
              onChange={handleFileChange}
              name={"rateListFileName"}
              claimInputs={[profileInput?.rateListFileName]}
            />
          )}

          <div className="flex justify-center gap-4 w-full mt-6">
            <DialogClose asChild>
              <Button variant="outline" className="text-[#3E79D6]">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleUpdateProfile}
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
