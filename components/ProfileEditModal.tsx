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
import { Eye } from "lucide-react";
import { useState } from "react";

export function ProfileEditModal({openEditProfile,setOpenEditProfile}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  return (
    <Dialog open={openEditProfile} onOpenChange={setOpenEditProfile}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger> */}
      <DialogContent className="max-w-md rounded-2xl px-6 py-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Profile edit
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 my-4">
          <label htmlFor="profile-photo" className="cursor-pointer">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-full border"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-full border bg-gray-100">
                <Eye className="w-8 h-8 text-gray-400" />
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

        <Input placeholder="Hospital Name" className="mb-3" />
        <Input
          placeholder="101, Kanchan Sagar, 18/1, Near Industry House"
          className="mb-3"
        />

        <Button className="w-full mb-4 bg-[#3E79D6]">
          <Eye className="w-4 h-4 mr-2" /> View Ratelist
        </Button>

        <div className="flex justify-center gap-4 w-full">
          <Button variant="outline" className="bg-[#F2F7FC] text-[#3E79D6]">
            Cancel
          </Button>
          <Button className=" bg-[#3E79D6]">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
