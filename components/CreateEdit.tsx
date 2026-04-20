import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { uploadFiles } from "@/services/files";
import Cookies from "js-cookie";

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onSubmit: (data: { name: string; age: number; image?: string }) => void;
    onSubmit: (data: { name: string; age: number; image?: string; hospitalId?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string;  hospitalUserId?: string };
  isEditMode?: boolean;
  hospitals?: { id: string; name: string }[];
  preSelectedHospitalId?: string;

}

export default function PatientFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultData,
  isEditMode = false,
  hospitals = [],
  preSelectedHospitalId = "", 

}: PatientFormDialogProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [image, setImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [fileUpload, setFileUpload] = useState({});
  const [hospitalId, setHospitalId] = useState<string | undefined>("");

  //  const isAdmin = Cookies.get("user_role")?.includes("ADMIN");
    const [errors, setErrors] = useState<{ name?: string; age?: string; hospitalId?: string }>({});

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].some(role => Cookies.get("user_role")?.includes(role));

  useEffect(() => {
    if (open) {
      if (defaultData) {
        setName(defaultData.name);
        setAge(defaultData.age);
        setImage(defaultData.url);
        setHospitalId(defaultData.hospitalUserId);
      } else {
        setName("");
        setAge(undefined);
        setImage(undefined);
        setHospitalId("");
        setHospitalId(preSelectedHospitalId || "");

      }
      setErrors({});
    }
  }, [defaultData, open, preSelectedHospitalId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImage(URL.createObjectURL(file));
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles"); // static folder key

    try {
      const res = await uploadFiles(formData);
      setFileUpload({
        fileName: res?.data?.key,
        url: res.data?.url,
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

   // Form Validation
  const validateForm = () => {
    let formIsValid = true;
    const validationErrors: any = {};

    if (!name.trim()) {
      validationErrors.name = "Name is required.";
      formIsValid = false;
    }

  if (!age || age < 1 || age > 100) {
  validationErrors.age = "Age must be a number between 1 and 100.";
  formIsValid = false;
}

    if (isAdmin && !hospitalId) {
      validationErrors.hospitalId = "Hospital is required for admin users.";
      formIsValid = false;
    }

    setErrors(validationErrors);
    return formIsValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSubmit({ name, age, ...fileUpload, hospitalId });
    onOpenChange(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (e.target.value.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, name: undefined }));
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setAge(value);
    if (value > 0) {
      setErrors(prevErrors => ({ ...prevErrors, age: undefined }));
    }
  };

  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHospitalId(e.target.value);
    if (isAdmin && e.target.value) {
      setErrors(prevErrors => ({ ...prevErrors, hospitalId: undefined }));
    }
  };
return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Patient" : "Create Patient"}</DialogTitle>
        </DialogHeader>

        {/* Photo Upload */}
        <div className="flex justify-center my-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="rounded-full w-20 h-20 bg-gray-200 flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt="Uploaded" className="object-cover w-full h-full" />
              ) : (
                <div className="text-gray-400">+</div>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Photo Upload</p>

        {/* Form */}
                  <div className="space-y-3 text-left">
          {/* Hospital Dropdown (only visible to admins) */}
          {isAdmin && hospitals.length > 0 && (
            <div>
              <select
                id="hospital"
                className={`w-full mt-3 p-2 border rounded-md disabled:cursor-not-allowed ${errors.hospitalId ? 'border-red-500' : ''}`}
                value={hospitalId}
                onChange={handleHospitalChange}
                 disabled={isEditMode} 
              >
                <option value="">Select Hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
              {errors.hospitalId && <p className="text-red-500 text-sm">{errors.hospitalId}</p>}
            </div>
          )}
            <div>
            <Input
              id="name"
              placeholder="Name"
              value={name}
              onChange={handleNameChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
            <Input
              type="number"
              id="age"
              placeholder="Age"
              value={age}
              onChange={handleAgeChange}
              className={errors.age ? "border-red-500" : ""}
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
          </div>
        </div>

        <Button
          disabled={loading}
          className="w-full mt-4 bg-[#3E79D6] text-white"
          onClick={handleSubmit}
        >
          {isEditMode ? "Update" : "Create"}
        </Button>
      </DialogContent>
    </Dialog>
  );
  
}
