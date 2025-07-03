import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";

type User = {
  id: number;
  claimID: number;
  patientName: string;
  disease: string;
  status: string;
  Doctor: string;
  createdDate: string;
  //   disease: string;
  //   disease: string;
  //   disease: string;
};

const users: User[] = [
  {
    id: 1,
    claimID: 11,
    patientName: "Md Nizam",
    disease: "fever",
    status: "active",
    Doctor: "Dr. SK",
    createdDate: "05-05-2025",
  },
  {
    id: 2,
    claimID: 22,
    patientName: "abc",
    disease: "fever",
    status: "active",
    Doctor: "Dr. xy",
    createdDate: "05-05-2025",
  },
];

export function DataTable() {
  return (
    <div className="rounded-md border">
      <div className="text-lg font-semibold m-4">
        {/* Search / Filters */}
        <input
          type="text"
          placeholder="search..."
          className="w-[50%] bg-gray-100 rounded-sm placeholder:text-[16px] p-2"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="text-center">
            <TableHead>ID</TableHead>
            <TableHead>Claim ID</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Disease</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow className="text-start" key={user.id + user.claimID}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.claimID}</TableCell>
              <TableCell>{user.patientName}</TableCell>
              <TableCell>{user.disease}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>{user.Doctor}</TableCell>
              <TableCell>{user.createdDate}</TableCell>
              <TableCell className="text-start space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  //   onClick={() => alert(`Viewing ${user.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  //   onClick={() => alert(`Editing claim for ${user.claimID}`)}
                >
                  Edit Claim
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  //   onClick={() => alert(`Editing patient ${user.patientName}`)}
                >
                  Edit Patient
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
