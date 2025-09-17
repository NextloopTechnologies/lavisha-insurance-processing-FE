import { Suspense } from "react";
import UserTableContent from "./UserTableContent";

export default function User() {
  return (
    <Suspense
      fallback={<div className="flex justify-center items-center"></div>}
    >
      <UserTableContent />
    </Suspense>
  );
}
