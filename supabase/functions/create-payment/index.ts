
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser(
    req.headers.get("Authorization")?.replace("Bearer ", "") || ""
  );
  if (userError || !user?.email) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  // Stripe setup
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const { amount, currency, bookingData } = body;

  if (
    !amount ||
    typeof amount !== "number" ||
    amount < 100 ||
    !currency ||
    !bookingData
  ) {
    return new Response(
      JSON.stringify({
        error: "Missing or invalid amount, currency, or booking data.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  // Attempt to find/create Stripe customer
  let customerId: string | undefined;
  try {
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
  } catch (err) {
    console.error("Stripe customer lookup error", err.message);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Salon Booking" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${body.successUrl || req.headers.get("origin")}/checkout?success=1`,
      cancel_url: `${body.cancelUrl || req.headers.get("origin")}/checkout?canceled=1`,
    });

    // Save order in Supabase (with service role key to bypass RLS for insert)
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    await serviceSupabase.from("orders").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount,
      currency,
      status: "pending",
      booking_data: bookingData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Stripe session error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
