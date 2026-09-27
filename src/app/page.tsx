"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { signInWithGoogle, signOut } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center text-muted-foreground">
        불러오는 중…
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      {user ? (
        <>
          <p className="text-lg">로그인됨: {user.email}</p>
          <code className="rounded-lg bg-muted px-3 py-2 text-sm">{user.id}</code>
          <p className="text-sm text-muted-foreground">
            ↑ RLS 정책에 넣을 소유자 UID
          </p>
          <Button variant="outline" onClick={() => signOut()}>
            로그아웃
          </Button>
        </>
      ) : (
        <Button onClick={() => signInWithGoogle()}>Google로 로그인</Button>
      )}
    </main>
  );
}
