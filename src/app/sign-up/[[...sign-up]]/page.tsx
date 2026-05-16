"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  // Mapper le rôle de l'URL vers le rôle Clerk
  const roleMapping: Record<string, string> = {
    client: "client",
    provider: "provider",
  };

  const selectedRole = role && roleMapping[role.toLowerCase()] ? roleMapping[role.toLowerCase()] : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        {selectedRole && (
          <div className="mb-6 rounded-lg bg-blue-500/10 border border-blue-500/50 p-4">
            <p className="text-sm text-blue-300">
              S'inscrire en tant que{" "}
              <span className="font-semibold">
                {selectedRole === "provider" ? "Prestataire" : "Client"}
              </span>
            </p>
          </div>
        )}
        
        <SignUp
          unsafeMetadata={{
            role: selectedRole || "client",
          }}
          {...(selectedRole
            ? { forceRedirectUrl: `/setup-role?role=${encodeURIComponent(selectedRole)}` }
            : {})}
        />
      </div>
    </div>
  );
}