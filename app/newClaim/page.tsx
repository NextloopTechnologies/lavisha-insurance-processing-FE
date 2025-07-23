"use client";

import FileDrag from "@/components/FileDrag";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import { Textarea } from "@/components/ui/textarea"
import { UploadCloud } from "lucide-react";
import { useState } from "react";

export default function AddClaimForm() {
  const [claimInputs, setClaimInputs] = useState({
    isPreAuth: false,
    patientName: "",
    doctorName: "",
    tpaName: "",
    insuranceCompany: "",
    desc: "",
    insuranceCard: "",
    preAuth: "",
    documentType_3: "",
    documentType_4: "",
    miscDocuments: "",
    aditionalNotes: "",
  });
  const handleSelectChange = (value: string | boolean, name: string) => {
    setClaimInputs((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleFileChange = (value, name) => {
    setClaimInputs((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // setLoading(true);
    // setPhoto(file)
    // setImage(URL.createObjectURL(file));
    console.log("file", file);
    // Simulate API upload
    // await new Promise((res) => setTimeout(res, 1500))
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles"); // static folder key

    console.log("formData", formData);
    // try {
    //   // const res = await axios.post("/api/upload", formData, {
    //   //   headers: { "Content-Type": "multipart/form-data" },
    //   // });
    //   const res = await uploadFiles(formData);
    //   console.log("Upload success:", res.data);
    //   setFileUpload({
    //     fileName: res?.data?.key,
    //     url: res.data?.url,
    //   });
    // } catch (error) {
    //   console.error("Upload error:", error);
    // } finally {
    //   setLoading(false);
    // }
  };
  console.log("claimInputs", claimInputs);

  return (
    <SidebarLayout>
      <div className="realtive h-[calc(100vh-80px)] bg-gray-100 overflow-y-scroll">
        <div className="flex justify-start gap-x-10 items-center mt-2 pl-16">
          <h2 className="text-lg font-semibold">Add New Claim</h2>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-sm shadow-sm">
            <Checkbox
              id="isPreAuth"
              className=""
              onCheckedChange={(e) => handleSelectChange(e, "isPreAuth")}
              checked={claimInputs.isPreAuth}
            />
            <Label htmlFor="proauth" className="text-sm">
              Is Pre-Auth Done?
            </Label>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-6xl mx-auto mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={claimInputs.patientName}
              onValueChange={(value) =>
                handleSelectChange(value, "patientName")
              }
            >
              <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black ">
                <SelectValue
                  placeholder="Patient Name"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="John Doe">John Doe</SelectItem>
                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Doctor Name"
              className="pl-2 w-full bg-[#F2F7FC] text-sm font-semibold text-black "
              value={claimInputs.doctorName}
              onChange={(e) => handleSelectChange(e.target.value, "doctorName")}
            />

            <Select
              value={claimInputs.tpaName}
              onValueChange={(value) => handleSelectChange(value, "tpaName")}
            >
              <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black">
                <SelectValue placeholder="TPA Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tpa1">TPA 1</SelectItem>
                <SelectItem value="tpa2">TPA 2</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={claimInputs.insuranceCompany}
              onValueChange={(value) =>
                handleSelectChange(value, "insuranceCompany")
              }
            >
              <SelectTrigger className="w-full bg-[#F2F7FC] text-sm font-semibold text-black">
                <SelectValue placeholder="Insurance Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tpa">TPA</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="my-4">
            <textarea
              value={claimInputs.desc}
              onChange={(e) => handleSelectChange(e.target.value, "desc")}
              placeholder="Description"
              className="bg-[#F2F7FC] text-sm font-semibold text-black placeholder:pl-2 min-h-[100px] outline-blue-300  focus:outline-border w-full"
            />
          </div>

          {/* Upload Fields */}
          <FileDrag
            title={"Insurance Card "}
            multiple={false}
            onChange={handleFileChange}
            name={"insuranceCard"}
          />
          <FileDrag
            title={"Pre Auth"}
            multiple={false}
            onChange={handleFileChange}
            name={"preAuth"}
          />
          <FileDrag
            title={"Document Type 3"}
            multiple={false}
            onChange={handleFileChange}
            name={"documentType_3"}
          />
          <FileDrag
            title={"Document Type 4"}
            multiple={false}
            onChange={handleFileChange}
            name={"documentType_4"}
          />
          <FileDrag
            title={"Misc Documents "}
            multiple={true}
            onChange={handleFileChange}
            name={"miscDocuments"}
          />

          <div className="mt-4">
            <textarea
              value={claimInputs.aditionalNotes}
              onChange={(e) =>
                handleSelectChange(e.target.value, "aditionalNotes")
              }
              placeholder="Additional Notes"
              className="bg-[#F2F7FC] text-sm font-semibold text-black placeholder:pl-2 min-h-[100px] outline-blue-300  focus:outline-border w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4 absolute bottom-5 right-20">
            <Button className="text-[#3E79D6]" variant="outline">
              Cancel
            </Button>
            <Button variant="outline" className="text-[#3E79D6]">
              Save as Draft
            </Button>
            <Button className="bg-[#3E79D6] px-4">Create</Button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
