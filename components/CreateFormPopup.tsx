import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { uploadFiles } from "@/services/files";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileDrag from "./FileDrag";
interface CreateFormPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { name: string; age: number; image?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string };
  isEditMode?: boolean;
  selectedTab: string;
}

export default function CreateFormPopup({
  open,
  onOpenChange,
  onSubmit,
  defaultData,
  isEditMode = false,
  selectedTab,
}: CreateFormPopupProps) {
  //   const [name, setName] = useState("");
  //   const [age, setAge] = useState<number | undefined>();
  //   const [image, setImage] = useState<string | undefined>();
  //   const [loading, setLoading] = useState(false);
  //   const [fileUpload, setFileUpload] = useState({});

  //   useEffect(() => {
  //     if (defaultData) {
  //       setName(defaultData.name);
  //       setAge(defaultData.age);
  //       setImage(defaultData.url);
  //     } else {
  //       setName("");
  //       setAge(undefined);
  //       setImage(undefined);
  //     }
  //   }, [defaultData, open]);
  const handleFileChange = async (value, name, multiple) => {};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-w-md text-center p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Patient" : `Create ${selectedTab}`}
          </DialogTitle>
        </DialogHeader>
        <div className="realtive w-full max-w-7xl">
          <div className="bg-white  w-full  mx-auto mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Doctor Name"
                className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                // value={claimInputs.doctorName}
                // onChange={(e) =>
                //   handleSelectChange(e.target.value, "doctorName")
                // }
              />
              <Input
                placeholder="Number of Days"
                className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
                // value={claimInputs.doctorName}
                // onChange={(e) =>
                //   handleSelectChange(e.target.value, "doctorName")
                // }
              />
            </div>

            <div className="my-4">
              <textarea
                // value={claimInputs.description}
                // onChange={(e) =>
                //   handleSelectChange(e.target.value, "description")
                // }
                placeholder="Description"
                className="bg-[#F2F7FC] text-sm font-semibold text-black placeholder:pl-2 min-h-[100px] outline-blue-300  focus:outline-border w-full"
              />
            </div>

            {/* Upload Fields */}

            <FileDrag
              title={"ICP "}
              multiple={false}
              onChange={handleFileChange}
              name={"ICP"}
            />

            <FileDrag
              title={"Reports"}
              multiple={false}
              onChange={handleFileChange}
              name={"PAST_INVESTIGATION"}
            />
            <FileDrag
              title={"OT (in case of surgery)"}
              multiple={false}
              onChange={handleFileChange}
              name={"CURRENT_INVESTIGATION"}
            />
            <FileDrag
              title={"Miscellaneous Documents"}
              multiple={true}
              // onChange={handleFileChange}
              name={"OTHER"}
            />

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4 absolute bottom-0 right-5">
              <Button className="text-[#3E79D6]" variant="outline">
                Cancel
              </Button>

              <Button
                // onClick={handleCreateClaim}
                className="bg-[#3E79D6] px-4"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
