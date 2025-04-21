
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Log environment variables availability (without exposing values)
  console.log("SUPABASE_URL available:", !!Deno.env.get("SUPABASE_URL"));
  console.log("SUPABASE_ANON_KEY available:", !!Deno.env.get("SUPABASE_ANON_KEY"));
  console.log("SUPABASE_SERVICE_ROLE_KEY available:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  console.log("STRIPE_SECRET_KEY available:", !!Deno.env.get("STRIPE_SECRET_KEY"));

  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    console.error("Error parsing request body:", e);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  // Create Supabase client for authentication
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
  // Get user from token
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  
  if (!token) {
    console.error("No authorization token provided");
    return new Response(JSON.stringify({ error: "No authorization token provided" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
  
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser(token);
  
  if (userError || !user?.email) {
    console.error("Auth error:", userError);
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  // Initialize Stripe with the secret key
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    console.error("Stripe secret key not found in environment");
    return new Response(JSON.stringify({ error: "Stripe configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeSecretKey, {
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
    console.error("Invalid request parameters:", { amount, currency, bookingData: !!bookingData });
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
    console.log("Looking up Stripe customer for email:", user.email);
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing Stripe customer:", customerId);
    } else {
      console.log("No existing customer found for email:", user.email);
    }
  } catch (err) {
    console.error("Stripe customer lookup error:", err.message);
  }

  try {
    console.log("Creating Stripe checkout session");
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
    console.log("Stripe checkout session created:", session.id);

    // Get Supabase service role client for database operations
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseServiceKey) {
      console.error("Service role key not found in environment");
      // Still return session URL, just won't save order to database
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Save order in Supabase with service role key to bypass RLS
    const serviceSupabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    const { error: orderError } = await serviceSupabase.from("orders").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount,
      currency,
      status: "pending",
      booking_data: bookingData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    if (orderError) {
      console.error("Error saving order to database:", orderError);
      // Don't fail the request if database insert fails, still return session URL
    } else {
      console.log("Order saved to database successfully");
    }

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
