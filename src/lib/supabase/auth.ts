import { supabase } from "./client";

/** 구글 OAuth 로그인 시작 (완료 후 홈으로 복귀 → detectSessionInUrl이 세션 교환) */
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
