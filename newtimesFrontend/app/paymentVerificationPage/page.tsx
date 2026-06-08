export const dynamic = "force-dynamic";

import { Suspense } from "react";
import PaymentVerifyClient from "./PaymentVerifyClient";

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentVerifyClient />
    </Suspense>
  );
}