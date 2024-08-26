"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { useRouter } from "next/navigation";

export function AppbarClient() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div>
      <Appbar 
        onSignin={signIn} 
        onSignout={async () => {
          await signOut({ callbackUrl: "http://ec2-13-60-180-62.eu-north-1.compute.amazonaws.com" });
        }}
        user={session?.user} 
      />
    </div>
  );
}
