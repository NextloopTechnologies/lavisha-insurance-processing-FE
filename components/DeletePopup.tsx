import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  imageSrc?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DeletePopup({
  open,
  onOpenChange,
  onConfirm,
  title = "Do you want to delete this item?",
  imageSrc = "/assets/delete-icon.svg",
  confirmText = "Delete",
  cancelText = "Cancel",
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center rounded-3xl">
        <DialogHeader className="flex justify-center">
          <img src={imageSrc} alt="delete" className="w-20 mx-auto" />
        </DialogHeader>

        <p className="text-lg font-medium">{title}</p>

        <div className="w-full flex justify-center items-center mt-4 gap-4">
          <Button
            variant="default"
            className="bg-[#3E79D6] text-white px-8"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
          <Button
            variant="outline"
            className="px-8"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
