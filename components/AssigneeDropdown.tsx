import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateClaimsAssignee } from "@/services/claims";
// import { updateClaimAssignee } from "@/api/claims";
// import { showSuccessToast, showErrorToast } from "@/lib/toastService";
import { toast } from "sonner";

const AssigneeDropdown = ({ claimId, currentAssignee, onUpdate, users }) => {
  const handleChange = async (value: string) => {
    try {
      // Optimistically update UI
      onUpdate(claimId, value);

      const res = await updateClaimsAssignee(claimId, { assignedTo: value });
      if (res.status === 200) {
        toast.success("Assignee updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update assignee");
      // Rollback UI if needed
      onUpdate(claimId, currentAssignee);
    }
  };

  return (
    <Select value={currentAssignee} onValueChange={handleChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Assigned to" />
      </SelectTrigger>
      <SelectContent>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AssigneeDropdown;
