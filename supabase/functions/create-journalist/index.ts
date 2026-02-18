// Create a journalist and a Supabase Auth user so they can log in.
// Call with: { email, password, name, role, department? }
// Requires SUPABASE_SERVICE_ROLE_KEY (set in Edge Function secrets).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, password, name, role, department } = await req.json();
    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({ error: "Missing email, password, name, or role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: missing service role key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Create Auth user (admin API)
    const { data: userData, error: authError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authUserId = userData.user?.id;
    if (!authUserId) {
      return new Response(
        JSON.stringify({ error: "User created but no id returned" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert journalist linked to auth user
    const { data: journalist, error: dbError } = await admin
      .from("journalists")
      .insert({
        auth_user_id: authUserId,
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        department: department?.trim() || null,
        status: "Active",
      })
      .select("*")
      .single();

    if (dbError) {
      // Rollback: delete the auth user we just created (best-effort)
      await admin.auth.admin.deleteUser(authUserId);
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ journalist }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
