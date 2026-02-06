"use client";
import { useUser, useSession } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useSupabase } from "../../../hooks/useSupabase";

export default function TestAuth() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const supabase = useSupabase();
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("Running...");

  const addLog = (msg: string) =>
    setLogs((p) => [
      ...p,
      `${new Date().toISOString().split("T")[1].slice(0, 8)}: ${msg}`,
    ]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      addLog("User not logged in");
      setStatus("Failed: No User");
      return;
    }

    const run = async () => {
      addLog(`User ID: ${user.id}`);

      // 1. Check Token
      let token = null;
      try {
        token = await session?.getToken({ template: "supabase" });
        if (token) {
          addLog(`Token: check (Length: ${token.length})`);
          // verify payload simple check
          const parts = token.split(".");
          if (parts.length === 3) {
            try {
              const payload = JSON.parse(atob(parts[1]));
              addLog(`Token Payload sub: ${payload.sub}`);
            } catch (e) {
              addLog("Token payload parse failed");
            }
          }
        } else {
          addLog("Token: MISSING (Check Clerk Template Name 'supabase')");
          setStatus("Failed: No Token");
          return;
        }
      } catch (e) {
        addLog(`Token Error: ${e}`);
        setStatus("Failed: Token Error");
        return;
      }

      // 2. Check Supabase 'patients' (RLS Protected)
      addLog("Checking Supabase 'patients' table...");
      try {
        const { data, error } = await supabase.from("patients").select("*");

        if (error) {
          addLog(`Supabase Error: ${error.message} (${error.code})`);
          addLog(`Details: ${error.details || "None"}`);
          setStatus("Failed: Supabase Error");
        } else {
          addLog(`Supabase Success! Rows: ${data?.length}`);
          if (data?.length === 0) {
            addLog("Warning: No patient record found for this user.");
            // Try insert
            addLog("Attempting optimistic insert...");
            const { data: newP, error: insErr } = await supabase
              .from("patients")
              .insert({
                clerk_id: user.id,
                display_name: "Test User",
                pin_hash: "1234",
              })
              .select();
            if (insErr) {
              addLog(`Insert Error: ${insErr.message}`);
            } else {
              addLog("Insert Success!");
            }
          } else {
            addLog(`Patient ID: ${data[0].id}`);
          }

          // 3. Check Media Assets (RLS / Schema)
          addLog("Checking 'media_assets' table...");
          const { data: media, error: mediaErr } = await supabase
            .from("media_assets")
            .select("id")
            .limit(1);
          if (mediaErr) {
            addLog(
              `Media Check Failed: ${mediaErr.message} (${mediaErr.code})`,
            );
            if (mediaErr.code === "42P01")
              addLog("CRITICAL: Table 'media_assets' does not exist!");
            setStatus("Failed: Media Error");
          } else {
            addLog(`Media Check Success! Rows: ${media?.length}`);

            // 4. Try Insert (Write Check)
            addLog("Attempting dummy insert into 'media_assets'...");
            const { data: ma, error: maErr } = await supabase
              .from("media_assets")
              .insert({
                patient_id: data[0].id,
                storage_path: "test/dummy.jpg",
                public_url: "https://example.com/dummy.jpg",
                type: "photo",
                metadata: { description: "Test Auth Insert" },
              })
              .select()
              .single();

            if (maErr) {
              addLog(`Insert Media Failed: ${maErr.message} (${maErr.code})`);
              setStatus("Failed: Media Write Error");
            } else {
              addLog("Insert Media Success!");
              await supabase.from("media_assets").delete().eq("id", ma.id);
              setStatus("Success!");
            }
          }
        }
      } catch (e) {
        addLog(`Supabase Exception: ${e}`);
        setStatus("Failed: Unexpected Error");
      }
    };

    run();
  }, [isLoaded, user, session, supabase]);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-4">Auth Diagnostic</h1>
      <div
        className={`text-xl mb-4 ${status.includes("Success") ? "text-green-500" : "text-red-500"}`}
      >
        Status: {status}
      </div>
      <div className="bg-gray-900 p-4 rounded border border-gray-700 whitespace-pre-wrap">
        {logs.join("\n")}
      </div>
    </div>
  );
}
