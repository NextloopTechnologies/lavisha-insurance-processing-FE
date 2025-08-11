import { Suspense } from "react";
import NewClaimsContent from "./NewClaimsContent";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function ClaimsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <LoadingOverlay />
        </div>
      }
    >
      <NewClaimsContent />
    </Suspense>
  );
}
