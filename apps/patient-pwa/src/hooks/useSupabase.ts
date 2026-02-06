import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";

export function useSupabase() {
  const { session } = useSession();

  return useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            let clerkToken = null;
            try {
              clerkToken = await session?.getToken({ template: "supabase" });
            } catch (tokenError) {
              console.error(
                "Clerk token retrieval failed (check 'supabase' template):",
                tokenError,
              );
            }

            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }

            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      },
    );
  }, [session]);
}
