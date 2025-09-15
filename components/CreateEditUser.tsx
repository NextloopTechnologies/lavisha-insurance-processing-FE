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

interface CreateEditUserProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: { name: string; age: number; image?: string }) => void;
  defaultData?: { name: string; age: number; image?: string; url?: string };
  isEditMode?: boolean;
  children
}

export default function CreateEditUser({
  open,
  onOpenChange,
  onSubmit,
  defaultData,
  isEditMode = false,
  children
}: CreateEditUserProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit User" : "Create User"}
          </DialogTitle>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}
