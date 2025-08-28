import { Suspense } from "react";
import SettlementsContent from "./SettlementsContent";

export default function ClaimsPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center items-center"></div>}
    >
      <SettlementsContent />
    </Suspense>
  );
}
