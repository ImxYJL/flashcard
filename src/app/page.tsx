"use client";

import Link from "next/link";
import { signInWithGoogle, signOut } from "@/lib/supabase/auth";
import { useUser } from "@/lib/supabase/useUser";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center text-muted-foreground">
        불러오는 중…
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 p-8">
      {user ? (
        <>
          <p className="text-lg">로그인됨: {user.email}</p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/cards/new">카드 만들기</Link>
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              로그아웃
            </Button>
          </div>
        </>
      ) : (
        <Button onClick={() => signInWithGoogle()}>Google로 로그인</Button>
      )}
    </main>
  );
}
