
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  
  // Set the auth token in Supabase client whenever user changes
  useEffect(() => {
    if (user) {
      const authToken = localStorage.getItem("sb-xqyqegtuurhybxlftnas-auth-token");
      if (authToken) {
        const { access_token } = JSON.parse(authToken);
        supabase.auth.setSession({ access_token, refresh_token: "" });
      }
    }
  }, [user]);

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
