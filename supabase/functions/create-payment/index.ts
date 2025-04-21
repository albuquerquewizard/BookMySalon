
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

  // Log request information for debugging
  console.log("Request received at:", new Date().toISOString());
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  
  // Check environment variables
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  console.log("Environment check:");
  console.log("SUPABASE_URL available:", !!supabaseUrl);
  console.log("SUPABASE_ANON_KEY available:", !!supabaseAnonKey);
  console.log("SUPABASE_SERVICE_ROLE_KEY available:", !!supabaseServiceKey);
  console.log("STRIPE_SECRET_KEY available:", !!stripeSecretKey);

  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is missing");
    return new Response(JSON.stringify({ 
      error: "Server configuration error: Stripe key is missing" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  let body: any = {};
  try {
    body = await req.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));
  } catch (e) {
    console.error("Error parsing request body:", e);
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const { amount, currency, bookingData, successUrl, cancelUrl } = body;

  if (!amount || typeof amount !== "number" || amount < 100 || !currency || !bookingData) {
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

  // Create Supabase client for authentication
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
  // Authenticate the user from token
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  
  if (!token) {
    console.error("No authorization token provided");
    return new Response(JSON.stringify({ error: "No authorization token provided" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
  
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user?.email) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("User authenticated:", user.email);

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

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
    } catch (err: any) {
      console.error("Stripe customer lookup error:", err.message);
    }

    console.log("Creating Stripe checkout session with params:", {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      currency,
      amount,
      successUrl: successUrl || req.headers.get("origin") + "/checkout?success=1",
      cancelUrl: cancelUrl || req.headers.get("origin") + "/checkout?canceled=1"
    });

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency,
              product_data: { 
                name: `Salon Service: ${bookingData.service ? 
                  (services.find(s => s.id.toString() === bookingData.service)?.name || "Service") 
                  : "Salon Booking"}`
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl || req.headers.get("origin") + "/checkout?success=1",
        cancel_url: cancelUrl || req.headers.get("origin") + "/checkout?canceled=1",
      });
      
      console.log("Stripe checkout session created:", session.id);
      console.log("Checkout URL:", session.url);

      // Save order in Supabase with service role key to bypass RLS
      if (supabaseServiceKey) {
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
        } else {
          console.log("Order saved to database successfully");
        }
      }

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err: any) {
      console.error("Stripe session creation error:", err.message);
      return new Response(JSON.stringify({ error: err.message || "Error creating Stripe session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (err: any) {
    console.error("General error:", err);
    return new Response(JSON.stringify({ error: err.message || "An unexpected error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Services array needed for reference
const services = [
  { id: 1, name: "Haircut & Style", price: 45 },
  { id: 2, name: "Classic Facial", price: 60 },
  { id: 3, name: "Beard Grooming", price: 35 },
  { id: 4, name: "Hair Coloring", price: 90 },
  { id: 5, name: "Highlights & Balayage", price: 120 },
  { id: 6, name: "Men's Haircut", price: 35 },
  { id: 7, name: "Luxury Facial", price: 85 },
  { id: 8, name: "Blowout & Styling", price: 50 },
  { id: 9, name: "Root Touch-Up", price: 65 }
];
