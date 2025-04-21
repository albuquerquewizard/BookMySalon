
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
