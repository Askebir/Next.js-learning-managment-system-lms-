"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";

export default function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ClerkProvider>
        <html>
          <body>{children}</body>
        </html>
      </ClerkProvider>
    </Suspense>
  );
}
