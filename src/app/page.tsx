"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/supabase/auth";
import { useUser } from "@/lib/supabase/useUser";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/review");
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <main className="flex flex-1 items-center justify-center text-muted-foreground">
        불러오는 중…
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <Button onClick={() => signInWithGoogle()}>Google로 로그인</Button>
    </main>
  );
}
