import { Suspense } from "react";
import ClaimsContent from "./ClaimsContent";

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div>Loading claims...</div>}>
      <ClaimsContent />
    </Suspense>
  );
}
