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

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; age: number; image?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string };
  isEditMode?: boolean;
}

export default function PatientFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultData,
  isEditMode = false,
}: PatientFormDialogProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [image, setImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [fileUpload, setFileUpload] = useState({});

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.name);
      setAge(defaultData.age);
      setImage(defaultData.url);
    } else {
      setName("");
      setAge(undefined);
      setImage(undefined);
    }
  }, [defaultData, open]);

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

  const handleSubmit = () => {
    onSubmit({ name, age, ...fileUpload });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Patient" : "Create Patient"}
          </DialogTitle>
        </DialogHeader>

        {/* Photo Upload */}
        <div className="flex justify-center my-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="rounded-full w-20 h-20 bg-gray-200 flex items-center justify-center overflow-hidden">
              {image ? (
                <img
                  src={image}
                  alt="Uploaded"
                  className="object-cover w-full h-full"
                />
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
          <div>
            <Input
              id="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="number"
              id="age"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
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
