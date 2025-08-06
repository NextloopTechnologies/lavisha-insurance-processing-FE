"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import InputComponent from "./InputComponent";
import FileDrag from "./FileDrag";
import { uploadFiles } from "@/services/files";
import { getProfileById, updateProfile } from "@/services/profile";

export function ProfileEditModal({ openEditProfile, setOpenEditProfile }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState([]);
  const loggedInUserId = localStorage.getItem("userId");
  const loggedInUserName = localStorage.getItem("userName");

  const [profileInput, setProfileInput] = useState({
    name: loggedInUserName,
    address: "",
    hospitalName: "",
    rateListFileName: "",
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleInputChange = (value: string | boolean, name: string) => {
    setProfileInput((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await getProfileById(loggedInUserId);
      setProfileData(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch patients:", err);
    }
  };
  useEffect(() => {
    fetchProfileData();
  }, [loggedInUserId]);

  useEffect(() => {
    if (!profileData?.length) {
      setProfileInput({
        name: loggedInUserName,
        address: "",
        hospitalName: "",
        rateListFileName: "",
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
        name: profileData[0]?.name || loggedInUserName,
        address: profileData[0]?.address,
        hospitalName: profileData[0]?.hospitalName,
        rateListFileName: profileData[0]?.rateListFileName,
      });
    }
  }, [profileData]);

  const handleFileChange = async (value, name, multiple) => {
    const formData = new FormData();
    formData.append("file", value[0]);
    formData.append("folder", "profiles");

    try {
      setLoading(true);
      const res = await uploadFiles(formData);
      setLoading(false);
      setProfileInput((prev) => ({
        ...prev,
        [name]: {
          fileName: res?.data?.key,
          type: name,
          ...(name === "OTHER" && { remark: "custom remark" }),
        },
      }));
    } catch (error) {
      setLoading(false);
      console.error("Single upload failed:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (loggedInUserId) {
      try {
        const payload = {
          ...profileInput,
        };
        setLoading(true);
        const res = await updateProfile(payload, loggedInUserId);
        if (res.status == 200) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        // setLoading(false);
      }
    }
  };
  return (
    <Dialog open={openEditProfile} onOpenChange={setOpenEditProfile}>
      <DialogContent className="max-w-md rounded-2xl px-6 py-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Profile edit
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-3 my-4">
          <label htmlFor="profile-photo" className="cursor-pointer">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-full border"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-full border ">
                {/* <Eye className="w-8 h-8 text-gray-400" /> */}
                <span className="text-[50px] font-semibold text-[#3E79D6] ">
                  {profileInput?.name[0]}
                </span>
              </div>
            )}
            <input
              id="profile-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <p className="text-sm text-center mt-2 text-gray-600">
              Change Profile Photo
            </p>
          </label>
        </div>

        <InputComponent
          placeHolder={"Hospital Name"}
          Icon={UserIcon}
          value={profileInput.hospitalName}
          onChange={(e) => handleInputChange(e.target.value, "hospitalName")}
        />

        {/* <InputComponent
          placeHolder={"Address"}
          Icon={UserIcon}
          value={profileInput.address}
          onChange={(e) => handleInputChange(e.target.value, "address")}
        /> */}

        <div className="my-4">
          <textarea
            value={profileInput.address}
            onChange={(e) => handleInputChange(e.target.value, "address")}
            placeholder="Address"
            className="bg-[#F2F7FC] text-sm font-semibold text-black pl-2 min-h-[100px] outline-blue-300  focus:outline-border w-full"
          />
        </div>

        <FileDrag
          title={"RateList FileName"}
          multiple={false}
          onChange={handleFileChange}
          name={"rateListFileName"}
          claimInputs={profileInput?.rateListFileName}
        />

        <div className="flex justify-center gap-4 w-full">
          <Button variant="outline" className="bg-[#F2F7FC] text-[#3E79D6]">
            Cancel
          </Button>
          <Button onClick={handleUpdateProfile} className=" bg-[#3E79D6]">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
